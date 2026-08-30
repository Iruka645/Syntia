<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Syntia (MyChatBot) - Agent Guidelines

ยินดีต้อนรับสู่โปรเจกต์ **Syntia** แอพพลิเคชัน ChatBot ส่วนตัวสำหรับการ Roleplay และการใช้งาน AI หลากหลาย Provider

## 1. ข้อมูลโปรเจกต์ (Project Overview)

Syntia คือระบบ ChatBot ที่เน้นการรันแบบ Local-first โดยมีฟีเจอร์หลักคือ:

- **Character Roleplay**: การสร้างและพูดคุยกับตัวละคร AI ที่กำหนดนิสัยได้
- **Multi-Provider Support**: รองรับ Google Gemini และ Provider อื่นๆ ในอนาคต
- **Session & Archive Management**: ระบบจัดการเซสชันและคลังข้อมูลผู้ใช้ (Archives)
- **Local Database**: ใช้ SQLite เพื่อความเป็นส่วนตัวและความรวดเร็ว

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Vanilla CSS
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **AI Integration**: Google Generative AI SDK

## 3. ข้อกำหนดในการพัฒนา (Development Rules)

เพื่อให้การพัฒนาเป็นไปอย่างราบรื่นและมีคุณภาพสูง โปรดปฏิบัติตามกฎต่อไปนี้:

### 3.1 สถาปัตยกรรม (Architecture)

- ใช้ **App Router** เท่านั้น (`src/app`)
- แยกส่วน UI ออกเป็น Component ย่อยๆ ใน `src/components`
- เก็บ Logic ที่ใช้ซ้ำใน `src/hooks` หรือ `src/lib`
- นิยาม Type ทั้งหมดใน `src/types`

### 3.2 ฐานข้อมูล (Database)

- ทุกการแก้ไข Schema ต้องทำผ่าน Prisma และรัน `npx prisma migrate dev`
- ใช้ Prisma Client ในการจัดการข้อมูลเสมอ ห้ามเขียน SQL Query ตรงๆ เว้นแต่จำเป็นจริงๆ

### 3.3 คุณภาพ Code และการทดสอบ (Testing)

- อ้างอิงแผนการทดสอบจาก [testRunPlan.md](file:///c:/Users/sanak/OneDrive/Desktop/MyChatBot/app/testRunPlan.md)
- ต้องรัน `npm run lint` และเช็ค Type (`tsc --noEmit`) ก่อนการแก้ไขที่สำคัญ
- รักษาความสะอาดของ Code และใช้ Prettier ในการจัด Format

### 3.4 AI Interaction Design

- UI ต้องดู Premium และมีความเป็น Modern Web (Gradients, Micro-animations)
- การโต้ตอบของ AI ในโหมด Chat ต้องมีความเป็นธรรมชาติและคงคาแรกเตอร์ของตัวละครไว้เสมอ

## 4. การจัดการความลับ (Security)

- ห้าม Commit ไฟล์ `.env` หรือ API Key ลงใน Repository
- ใช้ระบบ Environment Variables ของ Next.js ในการจัดการความลับเท่านั้น

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
