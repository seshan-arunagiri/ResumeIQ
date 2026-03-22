from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("test_resume.pdf", pagesize=letter)
c.drawString(100, 750, "Name: Rahul Sharma")
c.drawString(100, 730, "Email: rahul.sharma@gmail.com")
c.drawString(100, 710, "CGPA: 8.5")
c.drawString(100, 690, "Skills: Python, React, MySQL, JavaScript")
c.drawString(100, 670, "LeetCode: rahul_sharma_lc")
c.drawString(100, 650, "GitHub: rahulsharma")
c.drawString(100, 630, "Projects: E-commerce website, Chat application")
c.save()
print("test_resume.pdf created!")