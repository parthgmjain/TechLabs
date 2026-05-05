"""
UG.dk Education Scraper v11
============================
Fetches all education URLs from sitemap.xml.
Extracts GPA per institution, descriptions, and local requirements.

RUN:
    python ug_scraper.py
"""

import requests
import json
import time
import re
import os
from bs4 import BeautifulSoup

OUTPUT_FILE = "ug_educations.json"
DELAY_SECONDS = 0.5


def get_all_education_urls():
    print("Fetching all education URLs from sitemap.xml...")
    r = requests.get("https://www.ug.dk/sitemap.xml", headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, "xml")
    urls = [
        loc.text for loc in soup.find_all("loc")
        if "/videregaaende-uddannelser/" in loc.text
        and loc.text.count("/") >= 5
    ]
    print(f"Found {len(urls)} education URLs in sitemap")
    return urls


def extract_local_requirements(soup):
    """Extract local grade requirements per institution."""
    local_reqs = {}

    adgang = soup.find(id="adgangskrav")
    if not adgang:
        return local_reqs

    local_heading = adgang.find(string=lambda t: t and "lokale adgangskrav" in t.lower())
    if not local_heading:
        return local_reqs

    skip_phrases = [
        "gælder kun for", "læs mere", "om gymnasiale",
        "om adgangskrav", "om gsk", "suppleringskurser"
    ]

    current_uni = ""
    for el in local_heading.find_parent().find_next_siblings():
        if el.name == "p":
            text = el.get_text(strip=True)
            if not text:
                continue
            if any(phrase in text.lower() for phrase in skip_phrases):
                continue
            if len(text) < 60:
                current_uni = text
                local_reqs[current_uni] = []
        elif el.name in ["ul", "ol"] and current_uni:
            for li in el.find_all("li"):
                req = li.get_text(strip=True)
                if not req:
                    continue
                if any(phrase in req.lower() for phrase in skip_phrases):
                    continue
                if req not in local_reqs[current_uni]:
                    local_reqs[current_uni].append(req)

    return local_reqs


def scrape_education_page(url):
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "da-DK"},
            timeout=15
        )
        response.raise_for_status()
    except Exception as e:
        print(f"   Skipping — {e}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    page_text = soup.get_text()

    # -- Degree name --
    h1 = soup.find("h1")
    degree_name = h1.get_text(strip=True) if h1 else ""

    # -- Degree type from URL --
    url_parts = url.rstrip("/").split("/")
    degree_type = url_parts[-2].replace("-", " ").title() if len(url_parts) >= 2 else ""

    # -- Fact box: duration, cities --
    duration = ""
    cities = []
    fact_box = soup.find(class_="ug-fact-box")
    if fact_box:
        lines = [l.strip() for l in fact_box.get_text(separator="\n").split("\n") if l.strip()]
        for i, line in enumerate(lines):
            if "varighed" in line.lower() and i + 1 < len(lines):
                duration = lines[i + 1]
            elif "kan læses i" in line.lower():
                j = i + 1
                while j < len(lines) and not any(
                    kw in lines[j].lower() for kw in ["andre navne", "varighed", "fakta"]
                ):
                    cities.append(lines[j])
                    j += 1

    # -- Institutions --
    institutions = []
    for row in soup.find_all(class_="institution-row"):
        lines = [l.strip() for l in row.get_text(separator="\n").split("\n") if l.strip()]
        if lines:
            name = lines[0]
            city = ""
            for line in lines[1:4]:
                if line and len(line) < 25 and not any(c.isdigit() for c in line):
                    city = line
                    break
            if name and len(name) > 3 and {"university": name, "city": city} not in institutions:
                institutions.append({"university": name, "city": city})

    # -- Language --
    language = "Danish/English" if "english" in page_text.lower() else "Danish"

    # -- Description --
    description = ""
    for selector in [".ug-subheading", ".ug-lead", ".field--name-field-uddannelse-manchet", "p.manchet"]:
        el = soup.select_one(selector)
        if el:
            description = el.get_text(strip=True)[:400]
            break

    # -- GPA per institution --
    gpa_by_institution = []
    gpa_note = ""

    gpa_section = soup.find(id="adgangskvotienter")
    if gpa_section:
        current_university = ""
        any_gpa_found = False

        for row in gpa_section.find_all("tr"):
            if "sub-header" in (row.get("class") or []):
                current_university = row.get_text(strip=True)
            elif "ug-row" in (row.get("class") or []):
                cells = row.find_all("td")
                if len(cells) >= 3:
                    city = cells[0].get_text(strip=True)
                    gpa_text = cells[2].get_text(strip=True)
                    standby_text = cells[3].get_text(strip=True) if len(cells) >= 4 else ""

                    gpa_val = None
                    if gpa_text == "AO":
                        gpa_val = "AO"
                    else:
                        try:
                            val = float(gpa_text.replace(",", "."))
                            if 2.0 <= val <= 12.0:
                                gpa_val = val
                                any_gpa_found = True
                        except Exception:
                            pass

                    standby_val = None
                    if standby_text == "AO":
                        standby_val = "AO"
                    else:
                        try:
                            val = float(standby_text.replace(",", "."))
                            if 2.0 <= val <= 12.0:
                                standby_val = val
                        except Exception:
                            pass

                    if gpa_val is not None:
                        gpa_by_institution.append({
                            "university": current_university,
                            "city": city,
                            "quota_1_gpa_2025": gpa_val,
                            "standby_gpa": standby_val
                        })

        if not any_gpa_found and not gpa_by_institution:
            section_text = gpa_section.get_text(strip=True)
            if "uden for kvotesystemet" in section_text.lower():
                gpa_note = "Outside quota system"
            else:
                gpa_note = "Not available"

    # -- Mandatory subjects --
    mandatory_subjects = []
    for subject, level in re.compile(
        r'(matematik|dansk|engelsk|fysik|kemi|biologi|historie|'
        r'samfundsfag|informatik|musik|idræt|psykologi|geografi)\s*([ABC])',
        re.IGNORECASE
    ).findall(page_text):
        entry = {"subject": subject.capitalize(), "level": level.upper()}
        if entry not in mandatory_subjects:
            mandatory_subjects.append(entry)

    # -- Local requirements per institution --
    local_requirements = extract_local_requirements(soup)

    # -- Quota 2 admission type --
    admission_parts = []
    if "unitest" in page_text.lower():
        admission_parts.append("uniTEST")
    if "motiveret" in page_text.lower():
        admission_parts.append("Motivated Essay")
    if "portfolio" in page_text.lower():
        admission_parts.append("Portfolio")

    # -- Booster activities --
    booster_activities = []
    for keyword, label in [
        ("relevant erhvervserfaring", "Relevant work experience"),
        ("frivilligt arbejde", "Voluntary work"),
        ("udlandsophold", "International stay / Gap year"),
        ("højskoleophold", "Folk High School (Højskole)"),
        ("praktik", "Internship"),
    ]:
        if keyword in page_text.lower():
            booster_activities.append(label)

    url_slug = url.rstrip("/").split("/")[-1].upper().replace("-", "_")

    return {
        "id": f"UNI-{url_slug}",
        "source_url": url,
        "metadata": {
            "degree_name": degree_name,
            "degree_type": degree_type,
            "duration": duration,
            "language": language,
            "description": description,
            "institutions": institutions,
            "cities": cities,
        },
        "eligibility_gatekeeper": {
            "gpa_by_institution": gpa_by_institution,
            "gpa_note": gpa_note,
            "mandatory_subjects": mandatory_subjects,
            "local_requirements": local_requirements,
            "min_grade_requirements": ""
        },
        "quota_2_logic": {
            "admission_type": " / ".join(admission_parts),
            "booster_activities": booster_activities,
            "gap_year_impact_score": ""
        },
        "ai_semantic_data": {
            "pedagogy_style": "",
            "vibe_summary": "TODO: Fill with AI",
            "curriculum_keywords": [],
            "career_outcomes": []
        }
    }


def main():
    print("UG.dk Scraper v11 starting...")
    print("=" * 50)

    all_educations = []
    scraped_urls = set()

    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            all_educations = json.load(f)
            scraped_urls = {edu["source_url"] for edu in all_educations}
        print(f"Resuming — already have {len(all_educations)} educations")

    education_urls = get_all_education_urls()

    if not education_urls:
        print("No URLs found")
        return

    new_count = 0
    for i, url in enumerate(education_urls):
        if url in scraped_urls:
            continue
        print(f"[{i+1}/{len(education_urls)}] {url.split('/')[-1]}")
        education = scrape_education_page(url)
        if education:
            all_educations.append(education)
            scraped_urls.add(url)
            new_count += 1
            if new_count % 10 == 0:
                save_results(all_educations)
                print(f"   Saved {len(all_educations)} educations")
        time.sleep(DELAY_SECONDS)

    save_results(all_educations)
    print("\n" + "=" * 50)
    print(f"Done! {len(all_educations)} educations saved to {OUTPUT_FILE}")


def save_results(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
