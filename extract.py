import glob, json

files = glob.glob("/.aistudio/artifacts/brain/**/transcript.jsonl", recursive=True)
content = None
if files:
    with open(files[0], "r", encoding="utf-8", errors="ignore") as f:
        for line in reversed(f.readlines()):
            d = json.loads(line)
            if d.get("role") == "user":
                parts = d.get("parts", [])
                for p in parts:
                    if "HİDAYET AS" in str(p) and "BİRCAN ÖZTRAK" in str(p):
                        content = str(p)
                        break
            if content:
                break

if content:
    with open("raw_dprg.txt", "w", encoding="utf-8") as out:
        out.write(content)
    print("Saved raw_dprg.txt with length:", len(content))
else:
    print("Not found")

