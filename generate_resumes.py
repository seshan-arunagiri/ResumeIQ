import os
from fpdf import FPDF

# Ensure directory exists
os.makedirs("demo_resumes", exist_ok=True)

students = [
    {
        "name": "Rahul Sharma",
        "email": "rahul.s@example.com",
        "phone": "+91 9876543210",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 9.2/10.0\nGraduation: 2026",
        "skills": "Python, React, JavaScript, SQL, C++, Java, Git",
        "links": "LeetCode: leetcode.com/rahul_s\nGitHub: github.com/rahulsharma99",
        "projects": "- Build a scalable e-commerce backend in Python\n- React dashboard for analytics"
    },
    {
        "name": "Priya Patel",
        "email": "priya.p@example.com",
        "phone": "+91 9123456780",
        "education": "B.Tech in Information Technology, XYZ College\nCGPA: 8.5/10.0\nGraduation: 2026",
        "skills": "Java, Spring Boot, MySQL, REST APIs",
        "links": "LeetCode: leetcode.com/priya_codes\nGitHub: github.com/priyapatel",
        "projects": "- Hospital Management System using Java and MySQL\n- Spring Boot microservice for payments"
    },
    {
        "name": "Amit Kumar",
        "email": "amit.k@example.com",
        "phone": "+91 8888888888",
        "education": "B.Tech in Electronics, XYZ College\nPercentage: 71%\nGraduation: 2026",
        "skills": "HTML, CSS, JavaScript, Bootstrap",
        "links": "GitHub: github.com/amit_web",
        "projects": "- Portfolio website using HTML/CSS\n- Simple calculator app in JS"
    },
    {
        "name": "Sneha Desai",
        "email": "sneha.d@example.com",
        "phone": "+91 7777777777",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 9.5/10.0\nGraduation: 2026",
        "skills": "React, Node.js, Express, MongoDB, TypeScript",
        "links": "LeetCode: leetcode.com/sneha_dev\nGitHub: github.com/snehadesai",
        "projects": "- Full-stack social media clone\n- Real-time chat app using Socket.io"
    },
    {
        "name": "Rohan Singh",
        "email": "rohan.s@example.com",
        "phone": "+91 6666666666",
        "education": "B.Tech in Mechanical Engineering, XYZ College\nCGPA: 6.0/10.0\nGraduation: 2026",
        "skills": "Python, Django, SQLite",
        "links": "LeetCode: leetcode.com/rohan_s\nGitHub: github.com/rohan_django",
        "projects": "- Library management system in Django\n- Basic Python web scraper"
    },
    {
        "name": "Anjali Gupta",
        "email": "anjali.g@example.com",
        "phone": "+91 5555555555",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 7.8/10.0\nGraduation: 2026",
        "skills": "C, C++, Data Structures, Algorithms",
        "links": "LeetCode: leetcode.com/anjali_algo\nGitHub: github.com/anjali_ds",
        "projects": "- Implemented various tree and graph algorithms\n- Competitive programming repository"
    },
    {
        "name": "Vikram Reddy",
        "email": "vikram.r@example.com",
        "phone": "+91 4444444444",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 8.1/10.0\nGraduation: 2026",
        "skills": "Java, Android Development, Kotlin, Firebase",
        "links": "LeetCode: leetcode.com/vikram_r\nGitHub: github.com/vikram_droid",
        "projects": "- Android weather app using Retrofit\n- Task tracker app with Firebase backend"
    },
    {
        "name": "Neha Mishra",
        "email": "neha.m@example.com",
        "phone": "+91 3333333333",
        "education": "B.Tech in Information Technology, XYZ College\nCGPA: 8.9/10.0\nGraduation: 2026",
        "skills": "Python, Machine Learning, Data Science, Pandas, Scikit-Learn",
        "links": "GitHub: github.com/neha_ml",
        "projects": "- House price prediction model\n- Sentiment analysis on Twitter data"
    },
    {
        "name": "Karan Verma",
        "email": "karan.v@example.com",
        "phone": "+91 2222222222",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 6.5/10.0\nGraduation: 2026",
        "skills": "PHP, Laravel, MySQL",
        "links": "",
        "projects": "- Student attendance portal in PHP\n- E-commerce cart system"
    },
    {
        "name": "Pooja Iyer",
        "email": "pooja.i@example.com",
        "phone": "+91 1111111111",
        "education": "B.Tech in Computer Science, XYZ College\nCGPA: 9.0/10.0\nGraduation: 2026",
        "skills": "Java, React, SQL, AWS, Docker",
        "links": "LeetCode: leetcode.com/pooja_fullstack\nGitHub: github.com/pooja_iyer",
        "projects": "- Cloud-native microservices architecture\n- CI/CD pipeline setup for a React app"
    }
]

for i, student in enumerate(students):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Header
    pdf.set_font("Arial", 'B', 18)
    pdf.cell(200, 10, txt=student["name"], ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 8, txt=f"Email: {student['email']} | Phone: {student['phone']}", ln=True, align='C')
    
    if student["links"]:
        pdf.cell(200, 8, txt=student["links"].replace('\n', ' | '), ln=True, align='C')
    
    pdf.ln(10)
    
    # Education
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 8, txt="Education", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 8, txt=student["education"])
    pdf.ln(5)
    
    # Skills
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 8, txt="Technical Skills", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 8, txt=student["skills"])
    pdf.ln(5)
    
    # Projects
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 8, txt="Projects", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 8, txt=student["projects"])
    
    # Save
    filename = f"demo_resumes/Resume_{str(i+1).zfill(2)}_{student['name'].replace(' ', '_')}.pdf"
    pdf.output(filename)

print("Created 10 PDF resumes in the 'demo_resumes' folder!")
