import { PrismaClient } from "@prisma/client";
import { hashString } from "../src/lib/hash";

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════════════════════
// 100K SYNTHETIC REVIEWS - 4.6 STAR AVERAGE
// ══════════════════════════════════════════════════════════════════════════════

// Distribution for 4.6 average (100,000 reviews)
// 5 stars: 68,000 (68%)
// 4 stars: 24,000 (24%)
// 3 stars: 5,000 (5%)
// 2 stars: 2,000 (2%)
// 1 star: 1,000 (1%)
// = (68000*5 + 24000*4 + 5000*3 + 2000*2 + 1000*1) / 100000 = 4.60

const TOTAL_SYNTHETIC = 100000;
const DISTRIBUTION = {
  5: 68000,
  4: 24000,
  3: 5000,
  2: 2000,
  1: 1000,
};

// Featured testimonials (shown on homepage with scrolling animation)
const FEATURED_TESTIMONIALS = [
  {
    stars: 5,
    body: "Absolutely incredible! Recovered a 20-year-old WordPerfect file from my thesis. Thought it was gone forever. This tool saved me hours of retyping.",
    displayName: "Dr. Sarah Martinez",
    location: "Austin, TX",
    fileFormat: "WordPerfect .wpd",
  },
  {
    stars: 5,
    body: "Best data recovery tool I've used. Converted corrupt Excel 97 spreadsheets from our old accounting system. Saved our business records!",
    displayName: "Michael Chen",
    location: "San Francisco, CA",
    fileFormat: "Excel 97 .xls",
  },
  {
    stars: 5,
    body: "Game changer for anyone working with legacy files. The OCR on scanned PDFs is phenomenal. Extracted text perfectly from damaged documents.",
    displayName: "Jennifer Woods",
    location: "Seattle, WA",
    fileFormat: "PDF (scanned)",
  },
  {
    stars: 5,
    body: "I work in legal and we constantly get old .doc files from clients. This service converts them flawlessly while preserving formatting. Highly recommend!",
    displayName: "Robert Kim",
    location: "New York, NY",
    fileFormat: "Word 97 .doc",
  },
  {
    stars: 5,
    body: "Recovered my grandfather's dBASE database from the 90s with all family genealogy data. Thought it was lost forever. Thank you so much!",
    displayName: "Amanda Foster",
    location: "Boston, MA",
    fileFormat: "dBASE .dbf",
  },
  {
    stars: 5,
    body: "As an archivist, I deal with ancient file formats daily. This tool handles Lotus 1-2-3, old RTF files, everything. It's my go-to converter.",
    displayName: "David Park",
    location: "Chicago, IL",
    fileFormat: "Lotus 1-2-3",
  },
  {
    stars: 5,
    body: "The corruption repair is unreal. Had a damaged .docx from a crashed hard drive and it extracted 95% of the content. Saved my dissertation!",
    displayName: "Emily Roberts",
    location: "Denver, CO",
    fileFormat: "DOCX (corrupted)",
  },
  {
    stars: 5,
    body: "Best website for corrupted PDF recovery. Works like magic! Turned unreadable files into perfectly formatted documents.",
    displayName: "James Anderson",
    location: "Miami, FL",
    fileFormat: "PDF (corrupted)",
  },
  {
    stars: 5,
    body: "I had thousands of old .eml files from a defunct email client. Converted them all in batch mode. The Pro plan is worth every penny!",
    displayName: "Lisa Thompson",
    location: "Portland, OR",
    fileFormat: "EML (email)",
  },
  {
    stars: 5,
    body: "Mind-blowing OCR accuracy. Scanned images of typewritten documents from the 1970s extracted perfectly. This is the future of archiving.",
    displayName: "Marcus Williams",
    location: "Atlanta, GA",
    fileFormat: "TIFF (scanned)",
  },
  {
    stars: 5,
    body: "Best data retrieval kit on the internet. Period. Handles formats I didn't even know existed. The magic byte detection is genius.",
    displayName: "Catherine Lee",
    location: "Phoenix, AZ",
    fileFormat: "RTF (legacy)",
  },
  {
    stars: 4,
    body: "Really solid tool. Converted old .wpd files from college without issues. Preview feature is great. Would give 5 stars if batch mode was free.",
    displayName: "Daniel Martinez",
    location: "Houston, TX",
    fileFormat: "WordPerfect .wpd",
  },
  {
    stars: 5,
    body: "Absolutely essential for anyone in data recovery. The health score tells you exactly what to expect before converting. Brilliant design!",
    displayName: "Rachel Green",
    location: "Minneapolis, MN",
    fileFormat: "ZIP archive",
  },
  {
    stars: 5,
    body: "Best website for old file format exchange. The format detection never fails. Converted obscure formats like .wk4 with zero effort.",
    displayName: "Kevin Brown",
    location: "Philadelphia, PA",
    fileFormat: "Lotus .wk4",
  },
  {
    stars: 4,
    body: "Works extremely well. Helped me recover corrupted spreadsheets from a failed RAID. Only minor formatting loss. Great for emergencies!",
    displayName: "Sophia Davis",
    location: "Las Vegas, NV",
    fileFormat: "XLSX (damaged)",
  },
  {
    stars: 5,
    body: "The AI repair feature is next level. It reconstructed partially corrupted Word files better than Microsoft's own repair tool. Highly impressed!",
    displayName: "Andrew Wilson",
    location: "San Diego, CA",
    fileFormat: "DOC (corrupted)",
  },
  {
    stars: 5,
    body: "Perfect for historians and researchers. Extracted data from ancient archive formats that nothing else could read. This tool is a lifesaver!",
    displayName: "Victoria Hayes",
    location: "Nashville, TN",
    fileFormat: "TAR.GZ archive",
  },
  {
    stars: 5,
    body: "Best website for corrupted PDF exchange and repair. Saved client presentations that were damaged during transfer. Client never knew the difference!",
    displayName: "Christopher Lee",
    location: "Dallas, TX",
    fileFormat: "PDF (damaged)",
  },
  {
    stars: 4,
    body: "Very reliable. Converted hundreds of old .msg Outlook files to readable format. Only wish it was slightly faster on large batches.",
    displayName: "Michelle Turner",
    location: "Salt Lake City, UT",
    fileFormat: "MSG (Outlook)",
  },
  {
    stars: 5,
    body: "Incredible service! The 100% local processing means I can trust it with sensitive legal documents. Privacy-first AND powerful. Perfect!",
    displayName: "Jonathan Reed",
    location: "Washington, DC",
    fileFormat: "ODT (encrypted)",
  },
];

// Generic review templates for bulk generation
const REVIEW_TEMPLATES = {
  5: [
    "Works perfectly! Recovered my old {format} file without any issues.",
    "Amazing tool! Converted {format} files that I thought were lost forever.",
    "Best file recovery service I've found. Handled {format} perfectly.",
    "Exactly what I needed. {format} conversion was flawless.",
    "Saved my important data from a damaged {format} file. Thank you!",
  ],
  4: [
    "Really solid tool. {format} conversion worked well with minor formatting issues.",
    "Works well for {format} files. Would be 5 stars if it was faster.",
    "Good service. Recovered most of my {format} data successfully.",
    "Reliable converter. {format} files processed correctly.",
  ],
  3: [
    "Decent tool. {format} conversion worked but lost some formatting.",
    "Works okay for {format} files. Gets the job done.",
  ],
  2: [
    "Had some issues with {format} files but eventually got it working.",
  ],
  1: [
    "Had trouble with my {format} file. Support helped resolve it.",
  ],
};

const FORMATS = [
  "PDF", "DOCX", "DOC", "XLSX", "XLS", "RTF", "WordPerfect .wpd",
  "CSV", "ODT", "EML", "dBASE .dbf", "Lotus 1-2-3", "ZIP",
];

const NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sam", "Drew", "Jamie", "Reese", "Blake", "Sage", "Rowan", "Finley",
];

const SURNAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
];

function generateReviewBatch(stars: number, count: number): any[] {
  const templates = REVIEW_TEMPLATES[stars as 1 | 2 | 3 | 4 | 5];
  const reviews: any[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
    const firstName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    
    // Generate unique IP hash for each synthetic review
    const syntheticIp = `synthetic-${stars}-${i}-${Date.now()}`;
    
    reviews.push({
      stars,
      body: template.replace("{format}", format),
      displayName: `${firstName} ${lastName.charAt(0)}.`,
      location: "",
      fileFormat: format,
      isSeeded: true,
      ipHash: hashString(syntheticIp).slice(0, 24),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
    });
  }

  return reviews;
}

async function seed() {
  console.log("🌱 Starting seed process...\n");

  // ────────────────────────────────────────────────────────────────────────────
  // Step 1: Clear existing seeded reviews
  // ────────────────────────────────────────────────────────────────────────────
  console.log("🗑️  Clearing old seeded reviews...");
  const deleted = await prisma.review.deleteMany({ where: { isSeeded: true } });
  console.log(`   Deleted ${deleted.count} old seeded reviews\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // Step 2: Insert featured testimonials (shown on homepage)
  // ────────────────────────────────────────────────────────────────────────────
  console.log("⭐ Creating featured testimonials...");
  const featured = FEATURED_TESTIMONIALS.map((t) => ({
    ...t,
    isSeeded: true,
    ipHash: hashString(`featured-${t.displayName}`).slice(0, 24),
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Last 6 months
  }));

  await prisma.review.createMany({ data: featured });
  console.log(`   ✅ Created ${featured.length} featured testimonials\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // Step 3: Generate 100K synthetic reviews with 4.6 average
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📊 Generating 100,000 synthetic reviews...");
  console.log("   Distribution for 4.6★ average:");
  console.log(`   5★: ${DISTRIBUTION[5].toLocaleString()} (${((DISTRIBUTION[5] / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)`);
  console.log(`   4★: ${DISTRIBUTION[4].toLocaleString()} (${((DISTRIBUTION[4] / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)`);
  console.log(`   3★: ${DISTRIBUTION[3].toLocaleString()} (${((DISTRIBUTION[3] / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)`);
  console.log(`   2★: ${DISTRIBUTION[2].toLocaleString()} (${((DISTRIBUTION[2] / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)`);
  console.log(`   1★: ${DISTRIBUTION[1].toLocaleString()} (${((DISTRIBUTION[1] / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)\n`);

  // Insert in batches to avoid memory issues
  const BATCH_SIZE = 1000;
  let totalInserted = 0;

  for (const [starsStr, count] of Object.entries(DISTRIBUTION)) {
    const stars = parseInt(starsStr);
    console.log(`   Inserting ${count.toLocaleString()} ${stars}★ reviews...`);
    
    const batches = Math.ceil(count / BATCH_SIZE);
    for (let batch = 0; batch < batches; batch++) {
      const batchCount = Math.min(BATCH_SIZE, count - batch * BATCH_SIZE);
      const reviews = generateReviewBatch(stars, batchCount);
      
      await prisma.review.createMany({ data: reviews });
      
      totalInserted += batchCount;
      
      // Progress indicator every 10k reviews
      if (totalInserted % 10000 === 0) {
        process.stdout.write(`   Progress: ${totalInserted.toLocaleString()}/${TOTAL_SYNTHETIC.toLocaleString()} (${((totalInserted / TOTAL_SYNTHETIC) * 100).toFixed(1)}%)\r`);
      }
    }
    console.log(`   ✅ ${stars}★ reviews complete`);
  }

  console.log(`\n   ✅ Total synthetic reviews created: ${totalInserted.toLocaleString()}\n`);

  // ────────────────────────────────────────────────────────────────────────────
  // Step 4: Verify statistics
  // ────────────────────────────────────────────────────────────────────────────
  console.log("📈 Verifying statistics...");
  const stats = await prisma.review.aggregate({
    _avg: { stars: true },
    _count: { id: true },
  });

  const distribution = await prisma.review.groupBy({
    by: ["stars"],
    _count: { id: true },
    orderBy: { stars: "desc" },
  });

  console.log(`\n   Total reviews: ${stats._count.id.toLocaleString()}`);
  console.log(`   Average rating: ${stats._avg.stars?.toFixed(2)}★`);
  console.log("\n   Distribution:");
  distribution.forEach((d) => {
    const pct = ((d._count.id / stats._count.id) * 100).toFixed(1);
    console.log(`   ${d.stars}★: ${d._count.id.toLocaleString()} (${pct}%)`);
  });

  console.log("\n✅ Seed complete!\n");
  console.log("🎯 Results:");
  console.log(`   • ${stats._count.id.toLocaleString()} total reviews`);
  console.log(`   • ${stats._avg.stars?.toFixed(1)}★ average rating`);
  console.log(`   • ${FEATURED_TESTIMONIALS.length} featured testimonials`);
  console.log("\n🚀 Ready for deployment!\n");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
