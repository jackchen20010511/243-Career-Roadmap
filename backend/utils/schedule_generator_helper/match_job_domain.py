from sentence_transformers import util



def matchJobDomain(model, job_domains: dict, input_job_title: str, input_skills: list):
    """
    job_domains: dict of { job_domain_name: [skill1, skill2, ...] }
    input_job_title: str (e.g., "Data Analyst")
    input_skills: list of strings OR list of [skill, ...] tuples (only first element used)
    """

    # Normalize input skills if passed as list of lists (e.g., [["Python", 0.5, 0.6], ...])
    if isinstance(input_skills[0], (list, tuple)):
        input_skills = [skill[0] for skill in input_skills]

    # Encode input job title and skills
    input_title_emb = model.encode(input_job_title, convert_to_tensor=True)
    input_skill_embs = model.encode(input_skills, convert_to_tensor=True)

    best_match = None
    best_score = -1

    for domain_title, domain_skills in job_domains.items():
        # Encode domain title
        domain_title_emb = model.encode(domain_title, convert_to_tensor=True)
        title_score = float(util.cos_sim(input_title_emb, domain_title_emb))

        # Encode domain skills
        domain_skill_embs = model.encode(domain_skills, convert_to_tensor=True)
        sim_matrix = util.cos_sim(input_skill_embs, domain_skill_embs).cpu().numpy()

        # For each input skill, get the best match in the domain
        best_sim_per_skill = sim_matrix.max(axis=1)
        skill_score = best_sim_per_skill.mean() if len(best_sim_per_skill) > 0 else 0.0

        combined_score = 0.4 * title_score + 0.6 * skill_score

        if combined_score > best_score:
            best_score = combined_score
            best_match = {
                "matched_domain": domain_title,
                "title_score": round(title_score, 4),
                "skill_score": round(skill_score, 4),
                "combined_score": round(combined_score, 4),
            }

    return best_match