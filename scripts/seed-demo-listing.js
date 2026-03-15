// Seed a fully built-out Pro demo listing for marketing/showcase
// The listing is UNPUBLISHED so it won't appear in search, sitemap, or any links.
// Access via: /boats/demo-pro-listing?preview=true
// Editable in admin at: /admin/boats
require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEMO_UUID = "00000000-0000-0000-0000-000000000001";

async function run() {
  // 1. Ensure Pro tier has is_highest_tier = true
  console.log("Ensuring Pro tier is configured correctly...");
  await pool.query(`
    UPDATE membership_tiers
    SET is_highest_tier = true,
        display_badge = true,
        badge_color = '#2563eb',
        show_analytics = true
    WHERE name = 'Pro'
  `);
  console.log("Pro tier updated.");

  // 2. Create demo operator (or update if exists)
  console.log("Creating demo operator...");
  const existingOp = await pool.query(
    `SELECT id FROM operators WHERE auth_user_id = $1`,
    [DEMO_UUID]
  );

  let operatorId;
  if (existingOp.rows.length > 0) {
    operatorId = existingOp.rows[0].id;
    await pool.query(
      `UPDATE operators SET membership_tier_id = (SELECT id FROM membership_tiers WHERE name = 'Pro') WHERE id = $1`,
      [operatorId]
    );
    console.log(`Updated existing demo operator (id: ${operatorId})`);
  } else {
    const proTier = await pool.query(`SELECT id FROM membership_tiers WHERE name = 'Pro'`);
    const res = await pool.query(
      `INSERT INTO operators (auth_user_id, email, company_name, contact_name, phone, membership_tier_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        DEMO_UUID,
        "demo@partyboatsusa.com",
        "Sunshine Charter Fishing",
        "Captain Mike Reynolds",
        "(555) 555-1234",
        proTier.rows[0].id,
      ]
    );
    operatorId = res.rows[0].id;
    console.log(`Created demo operator (id: ${operatorId})`);
  }

  // 3. Check if demo boat already exists
  const existingBoat = await pool.query(
    `SELECT id FROM boats WHERE slug = 'demo-pro-listing'`
  );
  if (existingBoat.rows.length > 0) {
    console.log(`Demo boat already exists (id: ${existingBoat.rows[0].id}). Skipping.`);
    console.log(`Preview URL: /boats/demo-pro-listing?preview=true`);
    await pool.end();
    return;
  }

  // 4. Create the demo boat
  console.log("Creating demo boat listing...");
  const boatRes = await pool.query(
    `INSERT INTO boats (
      operator_id, name, operator_name, slug, description_short, description_long,
      state_code, city_name, port_name, street_address, zip_code,
      latitude, longitude,
      min_price_per_person, max_price_per_person, capacity,
      phone, email, website_url, booking_url, booking_button_text, booking_link_target,
      social_facebook, social_instagram, social_youtube,
      is_featured, is_featured_admin, is_published,
      whats_included, available_extras,
      seo_title, seo_description
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13,
      $14, $15, $16,
      $17, $18, $19, $20, $21, $22,
      $23, $24, $25,
      $26, $27, $28,
      $29, $30,
      $31, $32
    ) RETURNING id`,
    [
      operatorId,
      "The Reel Deal",
      "Sunshine Charter Fishing",
      "demo-pro-listing",
      "Premier party boat fishing out of Clearwater, FL. Half-day and full-day trips for all skill levels.",
      `Welcome aboard The Reel Deal, Clearwater's premier party boat fishing experience! Our 65-foot vessel is built for comfort and great fishing, with a spacious deck, climate-controlled cabin, and top-of-the-line tackle.

Whether you're a first-time angler or a seasoned pro, our experienced crew will put you on the fish. We run half-day, full-day, and specialty trips targeting everything from snapper and grouper to king mackerel and mahi-mahi.

Every trip includes all bait, tackle, and fishing licenses. Our crew handles the rigging, baiting, and even cleaning your catch so you can take home fresh fillets ready for the dinner table.

We depart daily from Clearwater Marina, just minutes from Clearwater Beach. Free parking is available at the marina. We recommend arriving 30 minutes before departure to get settled and pick your spot on the rail.

The Reel Deal is perfect for family outings, birthday parties, corporate events, or just a fun day on the water with friends. Kids 12 and under fish at a discounted rate, and we welcome anglers of all ages and experience levels.

Our boat features a full galley serving hot food, cold drinks, and snacks throughout the trip. We also have clean restrooms, air-conditioned cabin space, and shaded seating areas.

Join us for an unforgettable day on the Gulf of Mexico!`,
      "FL",
      "Clearwater",
      "Clearwater Marina",
      "25 Causeway Blvd",
      "33767",
      "27.9775",
      "-82.8270",
      "55.00",
      "175.00",
      65,
      "(727) 555-1234",
      "info@sunshinecharterfishing.com",
      "https://example.com",
      "https://example.com/book",
      "Book Your Trip",
      "_blank",
      "https://facebook.com/example",
      "https://instagram.com/example",
      "https://youtube.com/example",
      false,
      false,
      false, // NOT published
      '{"Bait & Tackle","Fishing License","Rod & Reel Rental","Fish Cleaning","Ice for Your Catch"}',
      '{"Private Charter Upgrade","Cooler Rental","Premium Rod Rental","Food & Beverage Package","Photo Package"}',
      "The Reel Deal - Party Boat Fishing in Clearwater, FL | PartyBoatsUSA",
      "Book a half-day or full-day party boat fishing trip aboard The Reel Deal in Clearwater, FL. Snapper, grouper, king mackerel and more. All equipment included.",
    ]
  );
  const boatId = boatRes.rows[0].id;
  console.log(`Created demo boat (id: ${boatId})`);

  // 5. Link trip types
  console.log("Adding trip types...");
  const tripTypeIds = [1, 2, 3, 5, 6, 7, 10, 14]; // Half Day, Full Day, Night, 4hr, 6hr, 8hr, Private Charter, Shark
  for (const ttId of tripTypeIds) {
    await pool.query(
      `INSERT INTO boat_trip_types (boat_id, trip_type_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [boatId, ttId]
    );
  }

  // 6. Link amenities
  console.log("Adding amenities...");
  const amenityIds = [1, 2, 3]; // A/C, Restrooms, Galley
  for (const amId of amenityIds) {
    await pool.query(
      `INSERT INTO boat_amenities (boat_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [boatId, amId]
    );
  }

  // 7. Link species
  console.log("Adding species...");
  const speciesIds = [19, 49, 6, 21, 77, 8, 48, 3, 84, 60, 86, 79, 64, 159];
  // Red Snapper, Mangrove, Yellowtail, Red Grouper, Gag Grouper, Black Grouper,
  // King Mackerel, Mahi-Mahi, Greater Amberjack, Cobia, Lane Snapper, Vermilion, Scamp, Hogfish
  for (const spId of speciesIds) {
    await pool.query(
      `INSERT INTO boat_species (boat_id, species_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [boatId, spId]
    );
  }

  // 8. Add FAQs
  console.log("Adding FAQs...");
  const faqs = [
    {
      question: "What time should I arrive for my trip?",
      answer: "We recommend arriving at least 30 minutes before your scheduled departure time. This gives you time to park, check in at the dock, and find a good spot on the rail. Our morning trips typically depart at 8:00 AM and afternoon trips at 1:00 PM.",
    },
    {
      question: "Do I need to bring my own fishing gear?",
      answer: "No! All bait, tackle, rods, and reels are included with your ticket. Our crew will set you up with everything you need. If you prefer to bring your own rod, that's fine too. Just check with us beforehand about any rig restrictions.",
    },
    {
      question: "Is there food and drink available on the boat?",
      answer: "Yes, we have a full galley on board serving hot food, cold drinks, snacks, and beverages throughout the trip. You're also welcome to bring your own cooler with food and non-alcoholic drinks. Alcohol is available for purchase on board.",
    },
    {
      question: "What happens if the weather is bad on my trip day?",
      answer: "Safety is our top priority. If conditions are too rough to fish safely, we will cancel the trip and offer you a full refund or the option to reschedule. For light rain or overcast skies, we typically still go out since fish often bite better in those conditions! We'll contact you if there's a cancellation.",
    },
    {
      question: "Can I keep the fish I catch?",
      answer: "Absolutely! You can keep everything you catch within legal size and bag limits. Our crew stays up to date on all current regulations and will let you know what you can keep. We also offer complimentary fish cleaning so you can take home fresh fillets ready to cook.",
    },
    {
      question: "Are your trips good for kids and beginners?",
      answer: "Our trips are perfect for all ages and experience levels. Our crew is experienced at helping first-timers bait hooks, cast, and reel in fish. Kids 12 and under receive a discounted rate. We have life jackets in all sizes available on board.",
    },
    {
      question: "How much should I tip the crew?",
      answer: "Tipping is customary and appreciated. The industry standard is 15-20% of your ticket price. Our crew works hard to find fish, help passengers, and clean your catch. Tips are typically collected at the end of the trip and are shared among the crew.",
    },
    {
      question: "Do you offer private charter options?",
      answer: "Yes! We offer private charters for groups who want the whole boat to themselves. Private charters are great for birthday parties, corporate outings, bachelor parties, and family reunions. Contact us for pricing and availability.",
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    await pool.query(
      `INSERT INTO boat_faqs (boat_id, question, answer, sort_order) VALUES ($1, $2, $3, $4)`,
      [boatId, faqs[i].question, faqs[i].answer, i]
    );
  }

  await pool.end();

  console.log("\nDemo listing created successfully!");
  console.log(`Boat ID: ${boatId}`);
  console.log(`Operator ID: ${operatorId}`);
  console.log(`\nPreview URL: /boats/demo-pro-listing?preview=true`);
  console.log(`Admin edit: /admin/boats (find "The Reel Deal")`);
  console.log(`\nThe listing is UNPUBLISHED and will not appear in search or on the site.`);
  console.log(`Add images through the admin panel to complete the listing.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
