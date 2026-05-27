import json
import os
import time
from pathlib import Path

from flask import Flask, render_template, request, redirect, session, url_for
from supabase import create_client
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent


def load_local_env(env_path: str | None = None) -> None:
    path = BASE_DIR / (env_path or ".env")
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]

        os.environ.setdefault(key, value)


load_local_env()

app = Flask(__name__, static_folder="public", static_url_path="/static")
app.secret_key = os.environ.get("SECRET_KEY", "replace-this-with-a-secure-secret")

ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "veeboss-admin")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "collection-images")
CONTENT_FILE = BASE_DIR / "content.json"

print(
    "Supabase config:",
    "URL set" if bool(SUPABASE_URL) else "URL missing",
    "KEY set" if bool(SUPABASE_KEY) else "KEY missing",
    "BUCKET=" + SUPABASE_STORAGE_BUCKET,
)

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:
        print("Supabase initialization failed:", exc)
        supabase = None

DEFAULT_CONTENT = {
    "heroSubtitle": "welcome to",
    "heroDescription": "Luxury runway language translated through street instinct. Every silhouette is engineered to move with confidence, precision, and unapologetic identity.",
    "services": [
        {"title": "Bespoke & Custom", "description": "One-of-a-kind pieces crafted to your exact measurements and vision."},
        {"title": "Asoebi & Ankara", "description": "Traditional fabrics reimagined with contemporary tailoring and modern silhouettes."},
        {"title": "Casual Wears", "description": "Effortless two-piece sets and everyday pieces with couture-level finishing."},
        {"title": "Ready to Wear", "description": "Curated collections designed for immediate impact and everyday luxury."},
    ],
    "aboutNarrative": "Veeboss Stitches designs from the inside out, beginning with construction, movement, and emotional intent. In the atelier, hand-finished seams, engineered proportions, and experimental textiles converge to build garments that command both runway and street. Each collection is a study in duality: sharp but fluid, rebellious yet refined, rooted in craftsmanship and driven by future-facing vision.",
    "contactIntro": "For bespoke commissions, editorial pulls, and creative collaborations.",
    "contactEmail": "vbosssiere@gmail.com",
    "contactWhatsapp": "+234 7013169283",
    "contactLocation": "Basic estate lokogoma, Abuja, Nigeria",
    "socialInstagram": "https://www.instagram.com/veeboss_stitches/",
    "socialTikTok": "https://www.tiktok.com/@veebosssiere83",
    "socialPinterest": "https://pinterest.com/veebossstitches",
    "collections": [
        {
            "id": "steel-petals",
            "name": "Steel Petals",
            "season": "SS26",
            "image": "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1600&q=80",
            "note": "Crisp tailoring collides with fluid satin drapes in monochrome bloom.",
            "medium": "Architectural suiting and silk",
        },
        {
            "id": "nocturne-code",
            "name": "Nocturne Code",
            "season": "FW25",
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
            "note": "Structured leather, reflective surfaces, and precision cuts for urban nights.",
            "medium": "Leather, chrome textiles, and wool",
        },
        {
            "id": "rebel-atelier",
            "name": "Rebel Atelier",
            "season": "Resort 25",
            "image": "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1600&q=80",
            "note": "Hand-finished street silhouettes elevated with couture-grade detailing.",
            "medium": "Street tailoring and hand embellishment",
        },
        {
            "id": "velvet-voltage",
            "name": "Velvet Voltage",
            "season": "FW24",
            "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
            "note": "Soft matte velvets and metallic accents shaped into fearless runway statements.",
            "medium": "Velvet and metallic threadwork",
        },
        {
            "id": "concrete-bloom",
            "name": "Concrete Bloom",
            "season": "Capsule 24",
            "image": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=80",
            "note": "Soft florals remixed through tactical pockets and split-volume silhouettes.",
            "medium": "Technical cotton and jacquard",
        },
        {
            "id": "chrome-ritual",
            "name": "Chrome Ritual",
            "season": "FW23",
            "image": "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1800&q=80",
            "note": "Monastic lines, polished trims, and a stark black-silver palette.",
            "medium": "Wool crepe and mirror hardware",
        },
        {
            "id": "afterglow-district",
            "name": "Afterglow District",
            "season": "SS23",
            "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
            "note": "Luminous tones and draped panels built for movement under city lights.",
            "medium": "Satin blends and mesh layering",
        },
        {
            "id": "monolith-youth",
            "name": "Monolith Youth",
            "season": "FW22",
            "image": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1800&q=80",
            "note": "Oversized outerwear balanced by razor-cut underpinnings.",
            "medium": "Felted wool and bonded jersey",
        },
        {
            "id": "echo-frame",
            "name": "Echo Frame",
            "season": "SS22",
            "image": "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1c?auto=format&fit=crop&w=1800&q=80",
            "note": "Minimal shapes interrupted by asymmetrical hems and contrast stitching.",
            "medium": "Poplin and structured knit",
        },
        {
            "id": "midnight-utility",
            "name": "Midnight Utility",
            "season": "FW21",
            "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80",
            "note": "Cargo architecture refined with couture finishing and night-ready polish.",
            "medium": "Ripstop, wool, and coated denim",
        },
        {
            "id": "static-romance",
            "name": "Static Romance",
            "season": "SS21",
            "image": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
            "note": "Romantic volume sharpened with monochrome blocking and clean necklines.",
            "medium": "Organza and matte satin",
        },
        {
            "id": "future-nomad",
            "name": "Future Nomad",
            "season": "FW20",
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
            "note": "Travel-built layers engineered for movement, weather, and visual impact.",
            "medium": "Technical nylon and brushed wool",
        },
        {
            "id": "axis-line",
            "name": "Axis Line",
            "season": "SS20",
            "image": "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1600&q=80",
            "note": "Linear paneling and elongated silhouettes define this precision-forward release.",
            "medium": "Crepe suiting and mesh",
        },
        {
            "id": "new-ritual",
            "name": "New Ritual",
            "season": "FW19",
            "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
            "note": "Dark tailoring with ceremonial details inspired by city nightlife.",
            "medium": "Wool twill and leather trims",
        },
        {
            "id": "edge-bloom",
            "name": "Edge Bloom",
            "season": "SS19",
            "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80",
            "note": "Soft color accents meet hard-edged structure in directional spring looks.",
            "medium": "Silk blends and bonded cotton",
        },
        {
            "id": "origin-pulse",
            "name": "Origin Pulse",
            "season": "FW18",
            "image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
            "note": "The debut language: bold shoulders, narrow waists, and movement-led cuts.",
            "medium": "Tailored wool and velvet",
        },
    ],
    "process": [
        {"id": "process-01", "step": "01", "title": "Research and Mood", "detail": "References are translated into palettes, silhouette maps, and narrative direction."},
        {"id": "process-02", "step": "02", "title": "Pattern and Drape", "detail": "Every cut is developed on-body for precision movement and controlled volume."},
        {"id": "process-03", "step": "03", "title": "Finish and Styling", "detail": "Hand-finished detailing and styling calibration shape the final statement look."},
    ],
}

def load_content():
    if supabase:
        try:
            response = (
                supabase.table("site_content")
                .select("content")
                .eq("id", "site")
                .single()
                .execute()
            )
            if response.data and isinstance(response.data, dict):
                print("Content loaded from Supabase")
                return response.data.get("content", DEFAULT_CONTENT)
        except Exception as e:
            print(f"Supabase load error: {e}")

    if CONTENT_FILE.exists():
        try:
            data = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
            print("Content loaded from content.json")
            return data
        except Exception as e:
            print(f"content.json load error: {e}")

    print("Using DEFAULT_CONTENT")
    return DEFAULT_CONTENT


def save_content(data):
    supabase_ok = False
    supabase_error = None
    local_ok = False
    local_error = None

    if supabase:
        try:
            supabase.table("site_content").upsert(
                {"id": "site", "content": data}, on_conflict="id"
            ).execute()
            print("✓ Content saved to Supabase")
            supabase_ok = True
        except Exception as e:
            supabase_error = str(e)
            print(f"✗ Supabase save error: {supabase_error}")

    try:
        CONTENT_FILE.parent.mkdir(parents=True, exist_ok=True)
        CONTENT_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print("✓ Content saved to content.json (backup)")
        local_ok = True
    except (OSError, IOError) as e:
        # Gracefully handle read-only filesystems (e.g., serverless environments)
        if "read-only file system" in str(e).lower():
            print(f"⚠ content.json backup skipped (read-only filesystem)")
            local_ok = False
        else:
            local_error = str(e)
            print(f"✗ content.json save error: {local_error}")
    except Exception as e:
        local_error = str(e)
        print(f"✗ content.json save error: {local_error}")

    success = supabase_ok or local_ok
    if not success:
        print(f"WARNING: Both saves failed! Supabase: {supabase_error}, Local: {local_error}")
    
    return {"success": success, "supabase_ok": supabase_ok, "local_ok": local_ok, "supabase_error": supabase_error, "local_error": local_error}


content = load_content()

def get_render_context():
    global content
    if not isinstance(content, dict):
        content = DEFAULT_CONTENT.copy()

    collections = content.get("collections")
    if not isinstance(collections, list):
        collections = []
        content["collections"] = collections

    process = content.get("process")
    if not isinstance(process, list):
        process = []
        content["process"] = process

    services = content.get("services")
    if not isinstance(services, list):
        services = []
        content["services"] = services

    content.setdefault("heroSubtitle", DEFAULT_CONTENT["heroSubtitle"])
    content.setdefault("heroDescription", DEFAULT_CONTENT["heroDescription"])
    content.setdefault("aboutNarrative", DEFAULT_CONTENT["aboutNarrative"])
    content.setdefault("contactEmail", DEFAULT_CONTENT["contactEmail"])
    content.setdefault("contactWhatsapp", DEFAULT_CONTENT["contactWhatsapp"])
    content.setdefault("contactLocation", DEFAULT_CONTENT["contactLocation"])
    content.setdefault("contactIntro", DEFAULT_CONTENT["contactIntro"])
    content.setdefault("socialInstagram", DEFAULT_CONTENT["socialInstagram"])
    content.setdefault("socialTikTok", DEFAULT_CONTENT["socialTikTok"])
    content.setdefault("socialPinterest", DEFAULT_CONTENT["socialPinterest"])
    season_count = len({str(item["season"]) for item in collections if isinstance(item, dict) and item.get("season") is not None})
    content_source = "Supabase" if supabase else "local JSON"
    return {"content": content, "season_count": season_count, "content_source": content_source}

@app.route("/")
def home():
    return render_template("index.html", **get_render_context())

@app.route("/collections")
def collections():
    return render_template("collections.html", **get_render_context())

@app.route("/admin", methods=("GET", "POST"))
def admin():
    error = None
    unlocked = session.get("unlocked", False)

    if request.method == "POST":
        passcode = request.form.get("passcode", "")
        if passcode == ADMIN_PASSCODE:
            session["unlocked"] = True
            return redirect(url_for("admin"))
        error = "Invalid passcode"

    if not unlocked:
        return render_template("admin.html", unlocked=False, error=error, **get_render_context())

    return render_template("admin.html", unlocked=True, error=error, **get_render_context())

@app.route("/admin/save", methods=("POST",))
def admin_save():
    if not session.get("unlocked"):
        return {"error": "Unauthorized"}, 401

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return {"error": "Invalid JSON payload"}, 400

    global content
    content = payload

    result = save_content(content)
    if result["success"]:
        saved_to = "Supabase + backup" if result["supabase_ok"] and result["local_ok"] else ("Supabase" if result["supabase_ok"] else "local file")
        return {"status": "ok", "saved_to": saved_to}
    
    error_detail = []
    if result["supabase_error"]:
        error_detail.append(f"Supabase: {result['supabase_error']}")
    if result["local_error"]:
        error_detail.append(f"Local file: {result['local_error']}")
    
    error_msg = " | ".join(error_detail) if error_detail else "Unknown save error"
    print(f"SAVE FAILED: {error_msg}")
    return {"error": error_msg}, 500

@app.route("/admin/upload-image", methods=("POST",))
def admin_upload_image():
    if not session.get("unlocked"):
        return {"error": "Unauthorized"}, 401

    if not supabase:
        return {
            "error": "Supabase storage is not configured. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your deployment environment.",
        }, 503

    upload_file = request.files.get("file")
    collection_id = request.form.get("collection_id", "").strip()
    if not upload_file or not upload_file.filename:
        return {"error": "No file uploaded"}, 400

    filename = secure_filename(upload_file.filename)
    if not filename:
        return {"error": "Invalid file name"}, 400

    if not collection_id:
        collection_id = f"collection-{int(time.time())}"

    key = f"collections/{collection_id}/{int(time.time())}-{filename}"
    file_bytes = upload_file.read()
    try:
        result = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).upload(key, file_bytes)
        result_error = getattr(result, "error", None)
        if result_error:
            print(f"Upload error: {result_error}")
            return {"error": str(result_error)}, 500

        public_url = supabase.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(key)
        print(f"Image uploaded successfully: {key}")
        return {"url": public_url}
    except Exception as exc:
        print(f"Upload exception: {exc}")
        return {"error": str(exc)}, 500

@app.route("/admin/logout")
def admin_logout():
    session.pop("unlocked", None)
    return redirect(url_for("admin"))

if __name__ == "__main__":
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(debug=debug)
