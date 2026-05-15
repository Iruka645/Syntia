# Test/Run Implementation Plan (MyChatBot)

เอกสารนี้ระบุแผนการเพิ่มระบบทดสอบ (Testing) และการตรวจสอบความถูกต้องของ Code (Static Analysis) เพื่อลดข้อผิดพลาดก่อนที่จะทำการ Commit หรือ Deploy

## 1. เป้าหมาย (Goals)
- ลดข้อผิดพลาด (Bugs) ที่อาจเกิดขึ้นจากการแก้ไข Code ส่วนหนึ่งแล้วไปกระทบอีกส่วนหนึ่ง (Regression)
- มั่นใจว่า Code มีมาตรฐานเดียวกันและไม่มี Syntax/Type Errors
- ตรวจสอบ Flow สำคัญของแอปพลิเคชัน (เช่น การ Login, การส่งข้อความ) โดยอัตโนมัติ

---

## 2. Technology Stack ที่เลือกใช้

| ประเภทการทดสอบ | เครื่องมือ (Stack) | เหตุผลที่เลือก |
| :--- | :--- | :--- |
| **Linting** | ESLint (มีอยู่แล้ว) | เพื่อตรวจจับรูปแบบ Code ที่ผิดพลาดเบื้องต้น |
| **Formatting** | Prettier | เพื่อให้ Code ทั้งโปรเจกต์มี Format เดียวกัน ลดปัญหา Git Diff |
| **Type Checking** | TypeScript (tsc) | เพื่อตรวจสอบ Type Safety ทั่วทั้งโปรเจกต์ |
| **Unit/Integration Test** | **Vitest** | รวดเร็ว, รองรับ React 19 และ Next.js ได้ดีกว่า Jest ในยุคปัจจุบัน |
| **E2E Testing** | **Playwright** | มาตรฐานอุตสาหกรรมสำหรับการจำลองการใช้งานผ่าน Browser จริง (Login, Chat Flow) |
| **Automation** | **Husky** + **lint-staged** | รันการตรวจสอบโดยอัตโนมัติทันทีที่กด `git commit` |

---

## 3. รายละเอียดขั้นตอนการดำเนินการ (Implementation Steps)

### Phase 1: พื้นฐาน Code Quality (Static Analysis)
1. **Prettier Setup**: ติดตั้งและตั้งค่า `.prettierrc` เพื่อให้ Code สะอาด
2. **TypeScript Check Script**: เพิ่ม Script `"type-check": "tsc --noEmit"` เพื่อเช็ค Type ทั้งหมดโดยไม่สร้างไฟล์ Output

### Phase 2: ระบบ Unit & Component Testing (Vitest)
1. **Setup Vitest**: ติดตั้ง `vitest`, `@testing-library/react`, `jsdom`
2. **Component Testing**: เน้นทดสอบ Component สำคัญ เช่น `MessageInput`, `ChatHeader` เพื่อดูว่าแสดงผลและรับ Event ถูกต้องไหม
3. **Logic Testing**: ทดสอบ Hook และ Function ใน `src/lib` (เช่น การจัดการ Chat History)

### Phase 3: ระบบ End-to-End Testing (Playwright)
1. **Setup Playwright**: ติดตั้งและ Config ให้ทำงานร่วมกับ Next.js
2. **Test Cases**:
   - **Authentication Flow**: ทดสอบการเข้าสู่ระบบ (Login)
   - **Core Chat Flow**: ทดสอบการเลือก Character และการส่งข้อความโต้ตอบ
   - **Database Check**: ตรวจสอบว่าข้อมูลถูกบันทึกลง SQLite (dev.db) จริง

### Phase 4: ระบบป้องกันอัตโนมัติ (Pre-commit Hooks)
1. **Husky Setup**: ตั้งค่าให้รัน Script ก่อนการ Commit
2. **Workflow**: เมื่อสั่ง `git commit` ระบบจะรัน:
   - `lint-staged` (รันเฉพาะไฟล์ที่แก้ไข) -> Prettier & ESLint
   - `npm run type-check`
   - `npm run test:unit` (เฉพาะเคสสำคัญ)

---

## 4. แผนการเพิ่ม Scripts ใน `package.json`

```json
{
  "scripts": {
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate": "npm run lint && npm run type-check && npm run test"
  }
}
```

---

## 5. แผนการรันเพื่อหาข้อผิดพลาด (Execution Plan)

1. **ก่อนการพัฒนา (Pre-Dev)**: รัน `npm install` เพื่อให้แน่ใจว่าเครื่องมือครบ
2. **ระหว่างการพัฒนา (During Dev)**: เปิด `npm run test:watch` ทิ้งไว้เพื่อให้ระบบแจ้งเตือนทันทีเมื่อ Logic พัง
3. **ก่อน Commit (Pre-Commit)**: ระบบ Husky จะรัน `validate` โดยอัตโนมัติ ถ้ามี Error จะ Commit ไม่ผ่าน
4. **ก่อน Deploy (Pre-Release)**: รัน `npm run test:e2e` เพื่อจำลองการใช้งานจริงบน Browser ครบทุก Browser สำคัญ (Chrome, Firefox, Safari)

---

## 6. ลำดับความสำคัญ (Priority)
1. **P0**: TypeScript Check & Linting (ตั้งค่าไวที่สุดเพื่อคุมคุณภาพ Code)
2. **P1**: Authentication E2E Test (เพื่อให้มั่นใจว่า User จะเข้าใช้งานได้เสมอ)
3. **P2**: Unit Test สำหรับ Business Logic ที่ซับซ้อน
