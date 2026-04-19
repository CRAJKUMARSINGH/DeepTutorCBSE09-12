import os
import psycopg2
from psycopg2.extras import RealDictCursor

# DATABASE_URL = os.environ.get("DATABASE_URL")
DATABASE_URL = "postgresql://postgres@localhost:5432/postgres" # Adjust as needed

HINDI_CURRICULUM = {
    9: [
        "Do Bailon Ki Katha", "Lhasa Ki Aur", "Upbhoktavad Ki Sanskriti", 
        "Sanwle Sapnon Ki Yaad", "Premchand Ke Phate Joote", "Mere Bachpan Ke Din",
        "Sakhiyan Evam Sabad", "Vakhm", "Savaiye", "Qaidi Aur Kokila", 
        "Gram Shree", "Megh Aaye"
    ],
    10: [
        "Netaji Ka Chashma", "Balgobin Bhagat", "Lakhnavi Andaz", 
        "Ek Kahani Yeh Bhi", "Naubat Khane Mein Ibadat", "Sanskriti",
        "Surdas Ke Pad", "Ram-Lakshman-Parshuram Samvad", "Aatmakathya", 
        "Utsah - At Nahi Rahi Hai", "Yeh Danturit Muskan - Fasal", "Sangatkar"
    ],
    11: [
        "Namak Ka Daroga", "Miyan Nasiruddin", "Apu Ke Saath Dhai Saal",
        "Vidaai-Sambhushan", "Galta Loha", "Spiti Mein Baarish", "Rajani", 
        "Jamun Ka Ped", "Bharat Mata", "Kabeer", "Meera", "Ghar Ki Yaad"
    ],
    12: [
        "Bhakti", "Baazar Darshan", "Kaale Megha Paani De", "Pahalwan Ki Dholak",
        "Shirish Ke Phool", "Shram Vibhajan Aur Jati Pratha", "Atmaparichay",
        "Patang", "Kavita Ke Bahaane", "Baat Seedhi Thi Par", "Camere Mein Band Apahij",
        "Usha", "Badal Raag", "Kavitavali"
    ]
}

def seed_hindi():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not set.")
        return

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # 1. Create Hindi Subjects
        for grade in [9, 10, 11, 12]:
            cur.execute("""
                INSERT INTO subjects (name, grade, description, icon, color)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (name, grade) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            """, ("Hindi", grade, f"CBSE Hindi Curriculum for Grade {grade}", "hindi", "#ef4444"))
            
            subject_id = cur.fetchone()[0]
            print(f"Seeding Hindi Grade {grade} (ID: {subject_id})...")

            # 2. Create Chapters
            chapters = HINDI_CURRICULUM[grade]
            for idx, title in enumerate(chapters):
                cur.execute("""
                    INSERT INTO chapters (subject_id, title, chapter_number, summary)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (subject_id, title, idx + 1, f"Original NCERT lesson study for {title}"))
        
        conn.commit()
        print("Hindi curriculum seeded successfully!")
        cur.close()
        conn.close()

    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_hindi()
