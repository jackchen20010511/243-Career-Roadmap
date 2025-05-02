
import numpy as np
from pulp import LpProblem, LpMaximize, LpVariable, lpSum, lpSum, PULP_CBC_CMD
from collections import defaultdict



def build_prereq_map(prereq_graph):
    prereq_map = defaultdict(set)
    for src, tgt in prereq_graph.edges():
        prereq_map[tgt].add(src)
    return prereq_map

def extract_courses_for_skill(course_df, skill_name):
    """
    Extracts all courses that correspond to the given skill name from the course dataset.
    """
    return course_df[course_df["skill"].str.lower() == skill_name.lower()].copy()

def standardize_focus_scores(skill_list):
    """
    Standardizes the focus scores in the skill list so they sum to 1.
    Parameters:
    - skill_list (list): A list of skills with their focus-score and confidence level.
    Returns:
    - list: A standardized skill list where focus scores sum to 1.
    """
    # Extract focus scores
    focus_scores = np.array([entry[1] for entry in skill_list], dtype=np.float64)

    # Normalize so the sum equals 1
    total_focus = np.sum(focus_scores)
    if total_focus > 0:
        normalized_focus_scores = focus_scores / total_focus
    else:
        normalized_focus_scores = focus_scores  # If total is 0, keep them unchanged

    # Update skill list with standardized focus scores
    standardized_skill_list = [[skill[0], float(focus), skill[2]] for skill, focus in zip(skill_list, normalized_focus_scores)]

    return standardized_skill_list

import difflib

from sklearn.discriminant_analysis import StandardScaler

def compute_match_score(course_title, course_description, main_skill, all_skills, modules, prereq_graph):
    """
    Compute a course's match score based on:
    - Title match with main skill
    - Mentions of other skills from same module
    - Mentions of prerequisites of the main skill
    """

    # Normalize course text and skills
    title = course_title.lower()
    description = course_description.lower()
    full_text = f"{title} {description}"
    all_skill_names = [s[0].lower() if isinstance(s, (list, tuple)) else s.lower() for s in all_skills]
    main_skill = main_skill.lower()
    prereq_map = build_prereq_map(prereq_graph)

    score = 0.0

    # --- 1. Title Matching Boost ---
    if main_skill in title:
        score += 2.0  # Strong boost for exact match
    else:
        close_matches = difflib.get_close_matches(main_skill, [title], n=1, cutoff=0.8)
        if close_matches:
            score += 1.2  # Partial match

    # --- 2. Module Group Boost ---
    for module in modules:
        if main_skill in module["skills"]:
            same_module_skills = set(module["skills"]) - {main_skill}
            for skill in same_module_skills:
                if skill.lower() in full_text:
                    score += 0.5
                else:
                    matches = difflib.get_close_matches(skill.lower(), [full_text], n=1, cutoff=0.8)
                    if matches:
                        score += 0.3
            break

    # --- 3. Prerequisite Boost ---
    prereqs = prereq_map.get(main_skill, set())
    for prereq in prereqs:
        if prereq.lower() in full_text:
            score += 0.4
        else:
            matches = difflib.get_close_matches(prereq.lower(), [full_text], n=1, cutoff=0.8)
            if matches:
                score += 0.2

    return round(score, 3)


def compute_difficulty_scores(row, main_skill, skill_list):
    """
    Apply difficulty score computation to all courses in the dataset using the confidence level of the main skill.
    Parameters:
    - course_df (DataFrame): The dataset containing course information.
    - main_skill (str): The main skill for which courses are being evaluated.
    - skill_list (list): A list of skills with their focus-score and confidence level.
    Returns:
    - DataFrame: The original DataFrame with an added 'difficulty_score' column.
    """

    # Function to determine the ideal difficulty based on confidence
    def get_ideal_difficulty(confidence):
        if confidence >= 0.5:
            diff = 3
        elif confidence >= 0.3:
            diff = 2
        elif confidence >= 0.2:
            diff = 1.5
        elif confidence >= 0.1:
            diff = 1
        else:
            diff = 0
        return diff

    # Function to compute difficulty score for a single course row
    def get_difficulty_score(course_difficulty, user_confidence, is_pro_certificate):
        ideal_difficulty = get_ideal_difficulty(user_confidence)
        difficulty_penalty = 1 * np.abs(ideal_difficulty - course_difficulty)
        if is_pro_certificate and user_confidence >= 0.6:
            certificate_score = 10
        elif is_pro_certificate and user_confidence <= 0.3:
            certificate_score = -10
        else:
            certificate_score = 0
        return 1-difficulty_penalty + certificate_score

    
    main_skill_confidence = next((conf for skill, focus, conf in skill_list if skill.lower() == main_skill.lower()), 0)
    return get_difficulty_score(
        course_difficulty=row["difficulty_numeric"],
        user_confidence=main_skill_confidence,
        is_pro_certificate=(row["course_type"] == "Certificate")
    )

def greedy_course_selection(course_df, skill, D_ideal, alpha, beta, lambda_, gamma):
    """
    Greedy version of ILP: Select courses for a skill based on weighted score, under duration constraints.

    Parameters:
    - course_df (DataFrame): Full course dataset
    - skill (str): Current skill name
    - D_ideal (float): Ideal total duration to match
    - alpha, beta, lambda_, gamma: Weights from ILP

    Returns:
    - List of selected course dicts
    """
    # Filter for relevant skill
    relevant_courses = course_df[course_df["skill"].str.lower() == skill.lower()].copy()
    if relevant_courses.empty:
        return []

    # Compute the greedy score
    relevant_courses["greedy_score"] = (
        relevant_courses["match_score"] +
        alpha * relevant_courses["difficulty_score"] +
        beta * relevant_courses["wilson_score"] -
        lambda_ * relevant_courses["price"] -
        gamma     # penalize more selections
    )

    # Sort by greedy score descending
    sorted_df = relevant_courses.sort_values(by="greedy_score", ascending=False)

    # Duration constraint
    selected = []
    total_duration = 0
    D_min = 0.9 * D_ideal
    D_max = 1.1 * D_ideal

    for _, row in sorted_df.iterrows():
        dur = row["duration"]
        if total_duration + dur <= D_max:
            selected.append(row.to_dict())
            total_duration += dur

        if total_duration >= D_min and len(selected) >= 2:
            break

    # fallback: select shortest if empty
    if not selected and not sorted_df.empty:
        selected = [sorted_df.sort_values("duration").iloc[0].to_dict()]

    return selected


def suggest_courses(
    embedding_model,
    course_df,
    skill_list,
    total_weeks,
    weekly_hours,
    job_title,
    module_skills,
    prereq_graph,
    portion=0.8,
    alpha=0.5,
    beta=0.5,
    lambda_=0.5,
    gamma=1
):
    result = {}
    skill_list = standardize_focus_scores(skill_list)
    scaler = StandardScaler()

    for [skill, focus, confidence] in skill_list:
        main_skill = skill.lower()
        D_ideal = int(portion * total_weeks * weekly_hours * focus)

        # Extract + preprocess courses
        courses = extract_courses_for_skill(course_df, main_skill)
        if courses.empty:
            result[main_skill] = []
            continue

        courses["description_embedding"] = courses["description"].apply(
            lambda text: embedding_model.encode(text, convert_to_tensor=True)
        )
        courses["title_embedding"] = courses["title"].apply(
            lambda text: embedding_model.encode(text, convert_to_tensor=True)
        )
        courses["match_score"] = courses.apply(
            lambda row: compute_match_score(
                row["title"],
                row["description"],
                main_skill,
                skill_list,
                module_skills,
                prereq_graph
            ),
            axis=1
        )
        courses["difficulty_score"] = courses.apply(
            lambda row: compute_difficulty_scores(row, main_skill, skill_list), axis=1
        )

        # Normalize scores
        for col in ["match_score", "difficulty_score", "price", "wilson_score"]:
            courses[col] = scaler.fit_transform(courses[[col]])

        # Solve ILP
        selected_courses = greedy_course_selection(
            courses, main_skill, D_ideal, alpha, beta, lambda_, gamma
        )

        result[main_skill] = selected_courses

    return result