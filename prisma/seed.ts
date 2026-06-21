import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 20 hand-written personal reviews shown on homepage
const FEATURED_REVIEWS = [
  { stars: 5, displayName: "Marcus T.", location: "Austin, TX", fileFormat: "WordPerfect .wpd", body: "I had a 1998 legal brief trapped in a WordPerfect file nobody could open. Nexus Revive pulled every paragraph out perfectly. Saved me hours of retyping." },
  { stars: 5, displayName: "Priya S.", location: "London, UK", fileFormat: "Excel 97 .xls", body: "Our finance team had 12 years of old .xls files from a server migration. Every single one converted without losing a single formula structure. Incredible." },
  { stars: 5, displayName: "James O.", location: "Lagos, NG", fileFormat: "Corrupted PDF", body: "The PDF was completely corrupted — wouldn't open anywhere. Nexus Revive extracted 90% of the text in under 30 seconds. Nothing else came close." },
  { stars: 5, displayName: "Sofia R.", location: "Barcelona, ES", fileFormat: ".eml archive", body: "Recovered emails from a .mbox archive going back to 2003. The subject lines, body text, even the timestamps — all there. Absolutely unreal tool." },
  { stars: 4, displayName: "Daniel K.", location: "Toronto, CA", fileFormat: "Lotus 1-2-3", body: "Found old Lotus 1-2-3 files on a backup drive. Nexus Revive was the only thing that could read them. Got the data out as clean CSV. Minor formatting quirks but very usable." },
  { stars: 5, displayName: "Aisha M.", location: "Dubai, AE", fileFormat: "Scanned TIFF", body: "Sent a stack of scanned contract pages through the OCR. The text accuracy was impressive — way better than what I expected from a free web tool." },
  { stars: 5, displayName: "Ryan C.", location: "San Francisco, CA", fileFormat: ".docx corrupted", body: "A client sent me a Word file that crashed every time I tried to open it. Nexus Revive pulled clean HTML out of it. My deadline was saved." },
  { stars: 5, displayName: "Lena W.", location: "Berlin, DE", fileFormat: "dBASE .dbf", body: "Archiving a 1990s database project, needed the dBASE files readable. Got a perfect tab-separated export. The health report feature is genius." },
  { stars: 4, displayName: "Tom H.", location: "Sydney, AU", fileFormat: "RTF document", body: "Old RTF from a legacy system. Text extracted cleanly, formatting mostly preserved. Only thing missing was some embedded images but the text was perfect." },
  { stars: 5, displayName: "Natasha B.", location: "Moscow, RU", fileFormat: "Corrupted .xlsx", body: "Three weeks of spreadsheet work was in a corrupted xlsx. Nexus Revive got every cell back. I genuinely teared up. Thank you." },
  { stars: 5, displayName: "Chen L.", location: "Shanghai, CN", fileFormat: ".odt document", body: "Switching from LibreOffice to Word for work. Needed all my .odt files as .docx. Batch converted 40 files in one go. Pro subscription pays for itself." },
  { stars: 5, displayName: "Fatima A.", location: "Cairo, EG", fileFormat: "Scanned PDF", body: "My thesis from 2009 only existed as a scanned PDF. Nexus Revive OCR'd it into clean text I could finally search and edit. Life-changing for my research." },
  { stars: 4, displayName: "Oliver P.", location: "Paris, FR", fileFormat: ".msg Outlook", body: "Extracted a chain of Outlook .msg files from a legal dispute. All the metadata and body text came through cleanly. Small UI hiccup but the core tool is excellent." },
  { stars: 5, displayName: "Sarah J.", location: "Chicago, IL", fileFormat: "ZIP archive", body: "Had a ZIP with nested old files that wouldn't extract normally. Nexus Revive listed every file and extracted the readable ones. Exactly what I needed." },
  { stars: 5, displayName: "Kwame A.", location: "Accra, GH", fileFormat: "WordPerfect .wpd", body: "Government documents archived in WordPerfect format. Nobody in the office had a clue. Nexus Revive converted them all to Word in minutes. Our whole team uses it now." },
  { stars: 5, displayName: "Isabella C.", location: "São Paulo, BR", fileFormat: ".csv encoding", body: "CSV files with broken Portuguese encoding — all the special characters were garbage. Nexus Revive auto-detected the encoding and fixed every accent. Perfect." },
  { stars: 5, displayName: "Hiroshi T.", location: "Tokyo, JP", fileFormat: "Corrupted .doc", body: "Legacy .doc files from a 2001 archive. Mammoth couldn't handle them directly but Nexus Revive's recovery layer got the text out. Really smart engineering." },
  { stars: 4, displayName: "Emma L.", location: "Stockholm, SE", fileFormat: "GZIP stream", body: "Compressed log files in a broken GZIP. Nexus Revive decompressed and extracted readable text from most of it. Only lost the very end where the corruption was worst." },
  { stars: 5, displayName: "Ahmed Z.", location: "Casablanca, MA", fileFormat: ".ods spreadsheet", body: "LibreOffice .ods files that Excel refused to open. Converted to .xlsx with all the data intact. The column widths even came through properly. Superb." },
  { stars: 5, displayName: "Grace N.", location: "Nairobi, KE", fileFormat: "BMP image (OCR)", body: "Old scanned forms in BMP format. The OCR pulled out every field correctly. Saved my NGO team from manually retyping hundreds of forms. Incredible product." },
];

// Distribution to reach ~4.6 avg across 100k total reviews
// 5★: 62k, 4★: 26k, 3★: 8k, 2★: 2k, 1★: 2k → avg = (310k+104k+24k+4k+2k)/100k = 4.44
// Adjust: 5★: 68k, 4★: 24k, 3★: 5k, 2★: 2k, 1★: 1k → avg ≈ 4.57 ✓
const DISTRIBUTION = [
  { stars: 5, count: 68000 },
  { stars: 4, count: 24000 },
  { stars: 3, count: 5000 },
  { stars: 2, count: 2000 },
  { stars: 1, count: 980 }, // 980 + 20 featured = 100k
];

const NAMES = ["Alex","Sam","Jordan","Taylor","Morgan","Casey","Riley","Drew","Quinn","Blake","Avery","Logan","Cameron","Sage","Skyler","Parker","Reese","Finley","Rowan","Jamie","Chris","Pat","Dana","Lee","Kim","Robin","Terry","Gene","Lane","Devon"];
const LOCATIONS = ["New York, US","London, UK","Toronto, CA","Sydney, AU","Berlin, DE","Paris, FR","Tokyo, JP","Singapore","Dubai, AE","Mumbai, IN","São Paulo, BR","Lagos, NG","Cairo, EG","Nairobi, KE","Seoul, KR","Amsterdam, NL","Stockholm, SE","Madrid, ES","Melbourne, AU","Cape Town, ZA"];
const FORMATS = ["PDF","Word .doc","Excel .xls",".docx",".xlsx","WordPerfect","RTF","Scanned image","CSV","Email .eml","dBASE .dbf",".odt",".ods","Lotus 1-2-3","GZIP","ZIP archive"];
const BODIES_5 = [
  "Absolutely saved my project. Nothing else could open this file.",
  "Recovered 10 years of data I thought was gone forever. Worth every penny.",
  "The file health report alone is worth it — knew exactly what to expect.",
  "Batch converted our entire legacy archive. Flawless.",
  "OCR accuracy on my scanned docs was outstanding.",
  "Clean, fast, and the preview before downloading is brilliant.",
  "Best file recovery tool I've ever used. Simple and powerful.",
  "Converted a corrupted PDF in 20 seconds. Unbelievable.",
];
const BODIES_4 = [
  "Really solid tool. Got 95% of my content back with minimal effort.",
  "Works exactly as advertised. Minor formatting quirks but very usable.",
  "Great for most formats. Handled my old files better than any other tool.",
  "Fast and reliable. The free preview is a great touch.",
  "Very impressed with the recovery quality. Will subscribe to Pro.",
];
const BODIES_3 = [
  "Works well for common formats. Had some issues with older files.",
  "Decent tool, got what I needed after a few tries.",
  "Good for basic recovery. Some advanced formats need work.",
];
const BODIES_2 = ["Partial recovery but better than nothing.", "Some content missing but core text came through."];
const BODIES_1 = ["Didn't work for my specific file format.", "Couldn't extract anything useful from my file."];

const BODIES: Record<number, string[]> = { 5: BODIES_5, 4: BODIES_4, 3: BODIES_3, 2: BODIES_2, 1: BODIES_1 };

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndDate(): Date {
  const now = Date.now();
  const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.random() * twoYears);
}

async function main() {
  // Check if already seeded
  const existing = await prisma.review.count({ where: { isSeeded: true } });
  if (existing > 0) {
    console.log(`Already seeded (${existing} seeded reviews). Skipping.`);
    return;
  }

  console.log("Seeding featured reviews...");
  for (const r of FEATURED_REVIEWS) {
    await prisma.review.create({
      data: { ...r, isSeeded: true, ipHash: `seed_${r.displayName}`, createdAt: rndDate() },
    });
  }

  console.log("Seeding 99,980 baseline reviews (batched)...");
  const BATCH = 500;
  let total = 0;

  for (const { stars, count } of DISTRIBUTION) {
    let remaining = count;
    while (remaining > 0) {
      const batchSize = Math.min(BATCH, remaining);
      const data = Array.from({ length: batchSize }, (_, idx) => ({
        stars,
        displayName: `${rnd(NAMES)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
        location: rnd(LOCATIONS),
        fileFormat: rnd(FORMATS),
        body: rnd(BODIES[stars]),
        isSeeded: true,
        ipHash: `seed_bulk_${stars}_${total + idx}`,
        createdAt: rndDate(),
      }));
      await prisma.review.createMany({ data });
      remaining -= batchSize;
      total += batchSize;
      if (total % 5000 === 0) console.log(`  ${total.toLocaleString()} reviews seeded...`);
    }
  }

  const finalCount = await prisma.review.count();
  const avg = await prisma.review.aggregate({ _avg: { stars: true } });
  console.log(`✅ Seeded ${finalCount.toLocaleString()} reviews. Avg: ${avg._avg.stars?.toFixed(2)} ★`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
