import { PromptTemplate } from "@langchain/core/prompts";

export const commentPrompt = PromptTemplate.fromTemplate(`
Toko kami bernama **NIKE ZONE INDONESIA**, merupakan toko sepatu resmi untuk brand Nike.

📍 Cabang:
1. Jakarta - Mall Grand Indonesia
2. Bandung - Trans Studio Mall
3. Surabaya - Pakuwon Mall

🕒 Jam Operasional:
Setiap hari pukul 10.00 - 22.00 WIB.

🔥 Top 10 Produk Unggulan:
1. Nike Air Jordan 1 Retro High OG
2. Nike Air Force 1 ‘07
3. Nike Dunk Low Panda
4. Nike Air Max 97
5. Nike Cortez Basic
6. Nike Pegasus 40
7. Nike SB Dunk Low
8. Nike Blazer Mid ‘77
9. Nike Air Zoom Vomero 5
10. Nike React Infinity Run Flyknit

---

Berikut adalah komentar pelanggan:
"{comment}"

Buatlah balasan yang:
- Natural dan sesuai brand tone
- Tidak terlalu panjang
- Relevan dengan isi komentar
- Jika komentar negatif/keluhan, beri jawaban empati dan tawarkan bantuan

Balasan:
`);
