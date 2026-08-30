# 🛠️ คู่มือการติดตั้ง Syntia สำหรับผู้ใช้ใหม่

คู่มือนี้จะแนะนำขั้นตอนการติดตั้งและรันโปรเจกต์ **Syntia** บนเครื่องคอมพิวเตอร์ของคุณ (Local Machine) ตั้งแต่เริ่มต้น

---

## 📋 สิ่งที่ต้องเตรียม (Prerequisites)

ก่อนเริ่มการติดตั้ง โปรดตรวจสอบว่าเครื่องของคุณได้ติดตั้งโปรแกรมเหล่านี้แล้ว:

1.  **Node.js** (เวอร์ชัน 18.x ขึ้นไป) https://nodejs.org/en/download <--- required
2.  **npm** (ปกติจะติดตั้งมาพร้อมกับ Node.js) <--- required
3.  **Git** (สำหรับ Clone โปรเจกต์) https://git-scm.com/install/ <--- Optional

---

## 🚀 ขั้นตอนการติดตั้ง (Installation Steps)

### 1. Clone โปรเจกต์ หรือดาวน์โหลด Zip file

Clone (Git required):
ดาวน์โหลดโค้ดลงเครื่องของคุณด้วยคำสั่งบน cmd/ps:

```bash
git clone <URL_ของ_Repository>
cd MyChatBot/app
```

Zip file:

- ดาวน์โหลดแล้วแตกไฟล์
- จากนั้นเข้าไปในโฟลเดอร์ app แล้วเปิด cmd/ps
  ผ่าน Address Bar ของ Exlorer

### 2. ติดตั้ง Dependencies

ใช้ npm เพื่อติดตั้ง Library ทั้งหมดที่จำเป็น:

```bash
npm install
```

### 3. ตั้งค่า Environment Variables (.env)

โปรเจกต์นี้จำเป็นต้องใช้ค่าคอนฟิกบางอย่างที่คุณต้องกำหนดเอง:

1.  คัดลอกไฟล์ `.env.example` และเปลี่ยนชื่อเป็น `.env`
    ```bash
    cp .env.example .env
    ```
2.  เปิดไฟล์ `.env` ด้วยโปรแกรมแก้ไขข้อความ (เช่น VS Code) และใส่ข้อมูลดังนี้:
    - **GOOGLE_AI_API_KEY**: ใส่คีย์ Gemini API ของคุณ (ขอได้ที่ [Google AI Studio](https://aistudio.google.com/))
    - **NEXTAUTH_SECRET**: ใส่ข้อความสุ่มอะไรก็ได้ (ใช้สำหรับเข้ารหัส Session)
    - **NEXTAUTH_URL**: หากรันในเครื่องตัวเองให้ใช้ `http://localhost:3500`

### 4. เริ่มรันโปรแกรม

คุณสามารถเลือกรันได้ 2 โหมด:

**โหมดพัฒนา (Development Mode):**
ใช้เมื่อต้องการแก้ไขโค้ดและดูผลลัพธ์ทันที

```bash
npm run dev
```

**โหมดใช้งานในวงแลน (LAN Hosting - แนะนำ):**
ใช้เมื่อต้องการให้เครื่องอื่นๆ เข้าใช้งานได้ **ระบบจะทำการเตรียมฐานข้อมูลให้อัตโนมัติ**

```bash
npm run lan
```

### HTTPS สำหรับ Development และมือถือในวง LAN

ใช้งาน HTTPS บนเครื่องหลักเท่านั้น:

```bash
npm run dev:https
```

ใช้งาน HTTPS บนเครื่องหลักและมือถือที่เชื่อมต่อ Wi-Fi/LAN เดียวกัน:

```bash
npm run lan:https
```

คำสั่ง LAN จะค้นหา private IPv4 ของเครื่องโดยอัตโนมัติ ตั้ง `NEXTAUTH_URL` ให้ตรงกับ HTTPS URL
และแสดง URL สำหรับเปิดบนคอมพิวเตอร์และมือถือ เช่น `https://192.168.1.134:3500` หากเลือก network
adapter ผิด สามารถกำหนดเองก่อนรันด้วย `SYNTIA_LAN_HOST` ได้

การรันครั้งแรกอาจดาวน์โหลด `mkcert` และขอสิทธิ์ติดตั้ง Local CA บนเครื่องหลัก หลังจากสร้าง
certificate แล้ว จะมี public CA สำหรับมือถือที่ `certificates/syntia-local-ca.crt` ให้นำเฉพาะไฟล์นี้
ไปติดตั้งเป็น CA certificate บนมือถือ ห้ามคัดลอกหรือเผยแพร่ `rootCA-key.pem` โดยเด็ดขาด

บน iPhone/iPad ต้องติดตั้ง profile แล้วเปิด Full Trust ให้ certificate ส่วน Android ให้ติดตั้งเป็น
CA certificate จากเมนู Security/Encryption & credentials ชื่อเมนูอาจแตกต่างตามผู้ผลิต จากนั้นเปิด URL
ที่คำสั่งแสดง การอนุญาต Windows Firewall ให้เลือกเฉพาะ **Private networks**

---

## 💡 คำแนะนำในการเลือกโมเดล (Model Recommendations)

คุณสามารถสลับโมเดลได้ในไฟล์ `.env` ที่หัวข้อ `GEMINI_MODEL`:

1.  **gemini-3.1-flash-lite (แนะนำที่สุด)**:
    - **เหมาะสำหรับ**: การใช้งานทั่วไปและการ Roleplay
    - **จุดเด่น**: ตอบสนองเร็วมาก (Low Latency) และฉลาดพอที่จะเข้าใจบทบาทที่ซับซ้อน มีโควตาใช้งานฟรีสูง (500 ครั้ง/วัน และ 250k token per minute)
2.  **gemini-pro-latest**:
    - **เหมาะสำหรับ**: งานที่ต้องการการวิเคราะห์ลึกซึ้ง หรือตัวละครที่มีความซับซ้อนสูงมาก
    - **จุดเด่น**: ฉลาดที่สุดในตระกูล แต่จะตอบช้ากว่ารุ่น Flash และมีโควตาจำกัด (50 ครั้ง/วัน สำหรับสายฟรี)

---

## 📱 การเข้าใช้งาน (How to access)

- **ในเครื่องตัวเอง (HTTPS):** รัน `npm run dev:https` แล้วเปิด `https://localhost:3500`
- **ผ่านวงแลน (HTTPS):** รัน `npm run lan:https` แล้วใช้ URL ที่แสดง เช่น `https://192.168.1.134:3500`
- **HTTP แบบเดิม:** ยังสามารถใช้ `npm run dev` และ `npm run lan` ได้ตามเดิม

## 🦥 การใช้ Local Provider ผ่าน Unsloth

1. เปิด Unsloth และโหลดโมเดลที่ต้องการ จากนั้นเปิด OpenAI-compatible API
2. ไปที่ **Settings → AI Provider Settings** แล้วเลือก **Local (Unsloth)**
3. กรอก API endpoint ที่ Unsloth แสดง เช่น `http://127.0.0.1:8000/v1`
4. กรอก model ID ให้ตรงกับชื่อที่ server เปิดให้ใช้ และใส่ API key หาก server เปิด authentication
5. กด **Test Connection** ก่อนบันทึก

สามารถกำหนดค่า fallback ฝั่ง server ด้วย environment variables ต่อไปนี้:

```bash
LOCAL_AI_BASE_URL=http://127.0.0.1:8000/v1
LOCAL_AI_MODEL=local-model
LOCAL_AI_API_KEY=
LOCAL_AI_TIMEOUT_MS=120000
```

เมื่อรัน Syntia และ Unsloth บนเครื่องเดียวกัน `127.0.0.1` จะหมายถึงเครื่องที่รัน Next.js server

## 🔑 Soft Password Reset

หากลืมรหัสผ่าน ให้รันคำสั่งต่อไปนี้จากเครื่องที่เก็บฐานข้อมูล Syntia:

```bash
npm run reset-password -- Kensakato
```

คำสั่งจะขอ confirmation และรับรหัสใหม่แบบซ่อนตัวอักษร จากนั้นเปลี่ยนเฉพาะ password hash
โดย Characters, Chats, Messages, Archives และ Settings เดิมจะยังอยู่ครบ คำสั่งนี้ไม่ใช้หรือแสดง
`NEXTAUTH_SECRET` และต้องรันผ่าน interactive terminal เท่านั้น

การค้นหาบัญชีรองรับ username, Display Name, ตัวพิมพ์เล็ก/ใหญ่ และช่องว่างหัวท้าย หาก username
ในฐานข้อมูลมีช่องว่างเกินมา คำสั่งจะถามก่อนว่าจะ normalize username ไปพร้อมกับการรีเซ็ตหรือไม่

---

## ❓ ปัญหาที่พบบ่อย (Troubleshooting)

- **Error: GOOGLE_AI_API_KEY is missing**: ตรวจสอบว่าคุณได้ใส่คีย์ในไฟล์ `.env` และไม่ได้ใส่เครื่องหมายอัญประกาศ (`""`) ครอบไว้
- **Login ไม่ได้**: ตรวจสอบว่า `NEXTAUTH_URL` ในไฟล์ `.env` ตรงกับ URL ที่คุณกำลังเปิดใช้งานอยู่หรือไม่
- **เครื่องอื่นเข้าไม่ได้**: ตรวจสอบว่าคุณได้รันด้วยคำสั่ง `npm run lan` และได้เปิดพอร์ต **3500** ใน Windows Firewall แล้ว

---

_จัดทำโดย: Antigravity AI Assistant_
