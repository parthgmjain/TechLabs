"""
AI Enrichment Script
=====================
Loops through ug_educations.json and calls the Claude API
to fill in fields that cannot be scraped.

REQUIRES:
    pip install anthropic

RUN:
    export ANTHROPIC_API_KEY="your-key-here"
    python ai_enrichment.py
"""

import json
import time
import os
import anthropic

INPUT_FILE = "ug_educations.json"
OUTPUT_FILE = "ug_educations_enriched.json"
DELAY_SECONDS = 1.0


def enrich_education(client, education):
    meta = education.get("metadata", {})
    degree_name = meta.get("degree_name", "")
    degree_type = meta.get("degree_type", "")
    description = meta.get("description", "")
    institutions = meta.get("institutions", [])
    duration = meta.get("duration", "")

    gatekeeper = education.get("eligibility_gatekeeper", {})
    subjects = gatekeeper.get("mandatory_subjects", [])

    quota2 = education.get("quota_2_logic", {})
    booster = quota2.get("booster_activities", [])

    prompt = f"""You are a Danish higher education expert. Analyze this education and return ONLY a JSON object.

EDUCATION:
Name: {degree_name}
Type: {degree_type}
Duration: {duration}
Institutions: {', '.join([i.get('university', '') for i in institutions])}
Description: {description}
Mandatory subjects: {', '.join([f"{s['subject']} {s['level']}" for s in subjects])}
Booster activities: {', '.join(booster)}

Return ONLY this JSON with no explanation or markdown:
{{
  "pedagogy_style": "PPL (Project-based)" OR "Classical Lectures" OR "Case-based" OR "Blended",
  "vibe_summary": "3 sentences about the culture, workload, and social atmosphere. Focus on unique selling points.",
  "curriculum_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "career_outcomes": ["job1", "job2", "job3"],
  "gap_year_impact_score": "High" OR "Medium" OR "Low"
}}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()

        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        return json.loads(response_text)

    except json.JSONDecodeError as e:
        print(f"   JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"   API error: {e}")
        return None


def main():
    print("AI Enrichment Script starting...")
    print("=" * 50)

    if not os.path.exists(INPUT_FILE):
        print(f"File {INPUT_FILE} not found! Run ug_scraper.py first.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        educations = json.load(f)

    print(f"Loaded {len(educations)} educations from {INPUT_FILE}")

    enriched = []
    enriched_ids = set()

    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            enriched = json.load(f)
            enriched_ids = {e["id"] for e in enriched}
        print(f"Resuming — {len(enriched)} already enriched")

    client = anthropic.Anthropic()

    new_count = 0
    for i, education in enumerate(educations):
        edu_id = education.get("id", "")

        if edu_id in enriched_ids:
            continue

        degree_name = education.get("metadata", {}).get("degree_name", "?")
        print(f"[{i+1}/{len(educations)}] {degree_name}")

        ai_data = enrich_education(client, education)

        if ai_data:
            education["ai_semantic_data"] = ai_data
            print(f"   {ai_data.get('pedagogy_style', '')} | {', '.join(ai_data.get('career_outcomes', [])[:2])}")
        
        enriched.append(education)
        enriched_ids.add(edu_id)
        new_count += 1

        if new_count % 10 == 0:
            save_results(enriched)
            print(f"   Saved {len(enriched)} educations")

        time.sleep(DELAY_SECONDS)

    save_results(enriched)
    print("\n" + "=" * 50)
    print(f"Done! {len(enriched)} educations saved to {OUTPUT_FILE}")


def save_results(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
