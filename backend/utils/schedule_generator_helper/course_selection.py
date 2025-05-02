
import numpy as np

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

def greedy_course_selection(course_df, skill, D_ideal, min_courses=1, max_courses=5):
    """
    Greedily select courses for a given skill under duration and score constraints.

    Parameters:
    - course_df: DataFrame filtered to relevant courses for the skill.
    - skill: Skill name.
    - D_ideal: Ideal duration to fulfill for this skill.
    - min_courses: Minimum courses to select (default 1).
    - max_courses: Cap to avoid long loops (default 5).

    Returns:
    - List of selected course dicts.
    """
    if course_df.empty:
        return []

    duration_min = 0.9 * D_ideal
    duration_max = 1.1 * D_ideal

    # Score courses with weighted sum
    course_df = course_df.copy()
    course_df["greedy_score"] = (
        course_df["difficulty_score"] * 1.0 +
        course_df["wilson_score"] * 0.5 -
        course_df["price"] * 0.1
    )

    sorted_courses = course_df.sort_values(by="greedy_score", ascending=False)

    selected = []
    total_duration = 0.0

    for _, row in sorted_courses.iterrows():
        if len(selected) >= max_courses:
            break

        proposed_duration = total_duration + row["duration"]
        if proposed_duration > duration_max:
            continue  # skip if it would exceed max duration

        selected.append(row.to_dict())
        total_duration = proposed_duration

        if total_duration >= duration_min and len(selected) >= min_courses:
            break

    # Fallback if no course meets duration constraint
    if not selected:
        fallback = course_df.sort_values("duration").iloc[0]
        selected = [fallback.to_dict()]

    return selected

def suggest_courses(
    course_df,
    skill_list,
    total_weeks,
    weekly_hours,
    portion=0.8,
):
    result = {}
    skill_list = standardize_focus_scores(skill_list)

    for [skill, focus, confidence] in skill_list:
        print("course select start", skill)
        main_skill = skill.lower()
        D_ideal = int(portion * total_weeks * weekly_hours * focus)

        # Extract + preprocess courses
        courses = extract_courses_for_skill(course_df, main_skill)
        if courses.empty:
            result[main_skill] = []
            continue

        selected_courses = greedy_course_selection(courses, main_skill, D_ideal)
        result[main_skill] = selected_courses

    return result