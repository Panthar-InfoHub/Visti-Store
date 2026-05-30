import { hash } from "bcrypt";
import { prisma } from "./db";

async function main() {
  console.log("🌱 Starting seed...");

  // Create Admin User with better-auth structure
  const adminPassword = await hash("admin123", 10);
  const adminId = "admin-user-id-123";

  const admin = await prisma.user.upsert({
    where: { email: "admin@vyomtics.com" },
    update: {},
    create: {
      id: adminId,
      email: "admin@vyomtics.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  // Create credential account for admin
  await prisma.account.upsert({
    where: { id: `${adminId}-credential` },
    update: {},
    create: {
      id: `${adminId}-credential`,
      accountId: adminId,
      providerId: "credential",
      userId: adminId,
      password: adminPassword,
    },
  });

  console.log("✅ Admin user created");

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "development-boards" },
      update: {},
      create: {
        name: "Development Boards",
        slug: "development-boards",
        description: "Microcontrollers and development boards for IoT and embedded projects",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
        isActive: true,
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sensors" },
      update: {},
      create: {
        name: "Sensors & Modules",
        slug: "sensors",
        description: "Various sensors and electronic modules for your projects",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
        isActive: true,
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "robotics-kits" },
      update: {},
      create: {
        name: "Robotics & STEM Kits",
        slug: "robotics-kits",
        description: "Complete robotics and STEM educational kits",
        image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800",
        isActive: true,
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "3d-printing" },
      update: {},
      create: {
        name: "3D Printers & Accessories",
        slug: "3d-printing",
        description: "3D printers, filaments, and accessories",
        image: "https://images.unsplash.com/photo-1562043054-28a2e7d4f5e6?w=800",
        isActive: true,
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "tools" },
      update: {},
      create: {
        name: "Tools & Instruments",
        slug: "tools",
        description: "Essential tools for electronics and prototyping",
        image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800",
        isActive: true,
        order: 5,
      },
    }),
  ]);
  console.log("✅ Categories created");

  // Create Products
  const products = [
    {
      title: "Raspberry Pi 5 Model 8GB RAM",
      slug: "raspberry-pi-5-8gb",
      shortDescription: "Latest Raspberry Pi with 8GB RAM, perfect for AI and IoT projects",
      description:
        "The Raspberry Pi 5 is the latest generation of the popular single-board computer. With 8GB of RAM, it's perfect for running complex applications, AI projects, and IoT solutions. Features include: 2.4GHz quad-core ARM Cortex-A76 CPU, dual 4K display support, Gigabit Ethernet, and much more.",
      images: [
        "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
        "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800",
      ],
      categorySlug: "development-boards",
      mrp: 12999,
      sellingPrice: 10499,
      stock: 50,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      sections: [
        {
          type: "bullets",
          title: "What's in the Box",
          items: ["Raspberry Pi 5 Board", "Quick Start Guide", "Safety Instructions"],
        },
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Processor", value: "2.4GHz Quad-core ARM Cortex-A76" },
            { key: "RAM", value: "8GB LPDDR4X" },
            { key: "Storage", value: "MicroSD Card Slot" },
            { key: "Connectivity", value: "WiFi 6, Bluetooth 5.2, Gigabit Ethernet" },
            { key: "Ports", value: "2x USB 3.0, 2x USB 2.0, 2x Micro HDMI" },
          ],
        },
        {
          type: "text",
          title: "About This Product",
          content:
            "Perfect for hobbyists, educators, and professionals. Build anything from home automation systems to AI-powered projects with this powerful single-board computer.",
        },
      ],
      faqs: [
        {
          question: "Does it include a power supply?",
          answer:
            "No, power supply is sold separately. You need a USB-C power supply with at least 5V/3A output.",
        },
        {
          question: "Can I run Windows on this?",
          answer:
            "Yes, you can run Windows 10/11 IoT Core or use Raspberry Pi OS (Linux-based) which is recommended.",
        },
      ],
      tags: ["raspberry-pi", "single-board-computer", "iot", "ai"],
    },
    {
      title: "Arduino Uno R4 WiFi Development Board",
      slug: "arduino-uno-r4-wifi",
      shortDescription: "Latest Arduino with built-in WiFi and improved performance",
      description:
        "The Arduino Uno R4 WiFi is the newest addition to the iconic Uno family. Features a powerful 32-bit microcontroller with built-in WiFi connectivity, making it perfect for IoT projects. Compatible with existing Arduino shields and libraries.",
      images: [
        "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800",
        "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800",
      ],
      categorySlug: "development-boards",
      mrp: 3499,
      sellingPrice: 2799,
      stock: 120,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      sections: [
        {
          type: "bullets",
          title: "Key Features",
          items: [
            "Built-in WiFi",
            "32-bit ARM Cortex-M4",
            "14 Digital I/O Pins",
            "6 Analog Inputs",
            "Compatible with Arduino IDE",
          ],
        },
        {
          type: "specs",
          title: "Technical Specifications",
          items: [
            { key: "Microcontroller", value: "Renesas RA4M1 (Cortex-M4)" },
            { key: "Clock Speed", value: "48 MHz" },
            { key: "Flash Memory", value: "256 KB" },
            { key: "SRAM", value: "32 KB" },
            { key: "WiFi", value: "ESP32-S3" },
          ],
        },
      ],
      faqs: [
        {
          question: "Is it compatible with Arduino Uno shields?",
          answer:
            "Yes, it maintains the same form factor and pin layout as the classic Arduino Uno.",
        },
      ],
      tags: ["arduino", "microcontroller", "wifi", "iot"],
    },
    {
      title: "ESP32 DevKit V1 WiFi + Bluetooth Module",
      slug: "esp32-devkit-v1",
      shortDescription: "Popular ESP32 development board with WiFi and Bluetooth",
      description:
        "The ESP32 is a powerful and versatile microcontroller with built-in WiFi and Bluetooth capabilities. Perfect for IoT projects, home automation, and wireless communication applications. Low power consumption and rich peripheral set make it ideal for battery-powered projects.",
      images: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800"],
      categorySlug: "development-boards",
      mrp: 799,
      sellingPrice: 499,
      stock: 200,
      isActive: true,
      isFeatured: true,
      sections: [
        {
          type: "bullets",
          title: "Features",
          items: [
            "Dual-core processor",
            "WiFi 802.11 b/g/n",
            "Bluetooth 4.2",
            "30 GPIO pins",
            "CP2102 USB to UART",
          ],
        },
      ],
      faqs: [],
      tags: ["esp32", "wifi", "bluetooth", "iot"],
    },
    {
      title: "Ultrasonic Distance Sensor HC-SR04",
      slug: "ultrasonic-sensor-hcsr04",
      shortDescription: "Measure distance from 2cm to 400cm with ultrasonic technology",
      description:
        "The HC-SR04 ultrasonic sensor uses sonar to determine distance to an object. It offers excellent range accuracy and stable readings. Widely used in robotics, obstacle detection, and distance measurement projects.",
      images: ["https://images.unsplash.com/photo-1585241936511-c07e1326f3f1?w=800"],
      categorySlug: "sensors",
      mrp: 249,
      sellingPrice: 149,
      stock: 500,
      isActive: true,
      isBestSeller: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Range", value: "2cm - 400cm" },
            { key: "Accuracy", value: "3mm" },
            { key: "Operating Voltage", value: "5V DC" },
            { key: "Operating Current", value: "15mA" },
          ],
        },
      ],
      faqs: [],
      tags: ["sensor", "ultrasonic", "distance", "robotics"],
    },
    {
      title: "DHT22 Temperature & Humidity Sensor",
      slug: "dht22-temperature-humidity-sensor",
      shortDescription: "High-precision digital temperature and humidity sensor",
      description:
        "The DHT22 is a basic, low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air. Perfect for weather stations, home automation, and environmental monitoring projects.",
      images: ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800"],
      categorySlug: "sensors",
      mrp: 499,
      sellingPrice: 349,
      stock: 300,
      isActive: true,
      sections: [
        {
          type: "specs",
          title: "Technical Details",
          items: [
            { key: "Temperature Range", value: "-40°C to 80°C" },
            { key: "Humidity Range", value: "0-100% RH" },
            { key: "Accuracy", value: "±0.5°C, ±2-5% RH" },
            { key: "Interface", value: "Single-wire digital" },
          ],
        },
      ],
      faqs: [],
      tags: ["sensor", "temperature", "humidity", "weather"],
    },
    {
      title: "MPU6050 6-Axis Gyro & Accelerometer Module",
      slug: "mpu6050-gyro-accelerometer",
      shortDescription: "6-axis motion tracking device for robotics and drone projects",
      description:
        "The MPU6050 combines a 3-axis gyroscope and a 3-axis accelerometer on a single chip. It's perfect for motion detection, gesture recognition, drone stabilization, and gaming applications. Features built-in Digital Motion Processor (DMP).",
      images: ["https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800"],
      categorySlug: "sensors",
      mrp: 399,
      sellingPrice: 249,
      stock: 250,
      isActive: true,
      isFeatured: true,
      sections: [
        {
          type: "bullets",
          title: "Applications",
          items: [
            "Drones & Quadcopters",
            "Gaming Controllers",
            "Motion-based UI",
            "Self-balancing Robots",
            "Activity Tracking",
          ],
        },
      ],
      faqs: [],
      tags: ["sensor", "gyroscope", "accelerometer", "motion", "drone"],
    },
    {
      title: "4WD Smart Robot Car Chassis Kit",
      slug: "4wd-robot-car-chassis",
      shortDescription: "Complete robot car chassis with 4 motors and wheels",
      description:
        "Build your own autonomous robot car with this complete chassis kit. Includes 4 DC motors, wheels, battery holder, and sturdy acrylic platform. Compatible with Arduino, Raspberry Pi, and other development boards. Perfect for learning robotics and programming.",
      images: ["https://images.unsplash.com/photo-1563191617-a2b7d69d2f4d?w=800"],
      categorySlug: "robotics-kits",
      mrp: 1999,
      sellingPrice: 1499,
      stock: 80,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      sections: [
        {
          type: "bullets",
          title: "Package Includes",
          items: [
            "4x DC Motors with Gear Box",
            "4x Rubber Wheels",
            "2-layer Acrylic Chassis",
            "Battery Holder (18650)",
            "Screws & Spacers",
          ],
        },
        {
          type: "text",
          title: "Getting Started",
          content:
            "This kit is perfect for beginners and hobbyists. Add your choice of development board, sensors, and motor driver to create line-following robots, obstacle-avoiding robots, or remote-controlled cars.",
        },
      ],
      faqs: [
        {
          question: "Does it include a microcontroller?",
          answer:
            "No, this is a mechanical kit only. You need to add Arduino, Raspberry Pi, or ESP32 separately.",
        },
      ],
      tags: ["robotics", "chassis", "robot-car", "diy"],
    },
    {
      title: "Arduino Robot Building Kit for Beginners",
      slug: "arduino-robot-building-kit",
      shortDescription: "Complete robotics kit with Arduino Uno and all components",
      description:
        "Everything you need to start your robotics journey! This comprehensive kit includes Arduino Uno, motors, sensors, servo motor, LED matrix, and over 100 components. Comes with detailed tutorials and project ideas.",
      images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"],
      categorySlug: "robotics-kits",
      mrp: 5999,
      sellingPrice: 4499,
      stock: 45,
      isActive: true,
      isBestSeller: true,
      sections: [
        {
          type: "bullets",
          title: "What You'll Learn",
          items: [
            "Basic Electronics",
            "Arduino Programming",
            "Motor Control",
            "Sensor Integration",
            "Build 10+ Projects",
          ],
        },
        {
          type: "bullets",
          title: "Kit Contents",
          items: [
            "Arduino Uno R3",
            "Robot Chassis",
            "Ultrasonic Sensor",
            "Servo Motor",
            "Motor Driver",
            "100+ Components",
            "Project Guide Book",
          ],
        },
      ],
      faqs: [],
      tags: ["arduino", "robotics", "stem", "educational", "beginner"],
    },
    {
      title: "Line Follower Robot DIY Kit",
      slug: "line-follower-robot-kit",
      shortDescription: "Build your own line-following robot with IR sensors",
      description:
        "Complete DIY kit to build a line-following robot. Includes PCB, microcontroller, IR sensors, motors, and all necessary components. Great for learning about autonomous robotics and sensor-based navigation.",
      images: ["https://images.unsplash.com/photo-1527430253228-e93688616381?w=800"],
      categorySlug: "robotics-kits",
      mrp: 1499,
      sellingPrice: 999,
      stock: 100,
      isActive: true,
      isOnSale: true,
      sections: [
        {
          type: "bullets",
          title: "Features",
          items: [
            "Pre-programmed Microcontroller",
            "4 IR Sensors",
            "High Torque Motors",
            "LED Indicators",
            "Easy Assembly",
          ],
        },
      ],
      faqs: [],
      tags: ["robotics", "line-follower", "ir-sensor", "diy"],
    },
    {
      title: "Bambu Lab P1P 3D Printer",
      slug: "bambu-lab-p1p-3d-printer",
      shortDescription: "High-speed CoreXY 3D printer with multi-color support",
      description:
        "The Bambu Lab P1P is a high-performance 3D printer featuring CoreXY motion system, automatic bed leveling, and impressive print speeds up to 500mm/s. Built-in sensors ensure consistent print quality. Perfect for both hobbyists and professionals.",
      images: ["https://images.unsplash.com/photo-1562043054-28a2e7d4f5e6?w=800"],
      categorySlug: "3d-printing",
      mrp: 54999,
      sellingPrice: 47999,
      stock: 15,
      isActive: true,
      isFeatured: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Build Volume", value: "256 x 256 x 256 mm" },
            { key: "Max Speed", value: "500 mm/s" },
            { key: "Layer Height", value: "0.05 - 0.35 mm" },
            { key: "Nozzle Temp", value: "Up to 300°C" },
            { key: "Bed Temp", value: "Up to 100°C" },
          ],
        },
      ],
      faqs: [],
      tags: ["3d-printer", "bambu-lab", "corexy", "fast-printing"],
    },
    {
      title: "PLA+ 3D Printer Filament 1kg - Premium Quality",
      slug: "pla-plus-filament-1kg",
      shortDescription: "High-quality PLA+ filament with enhanced strength",
      description:
        "Premium PLA+ filament with improved toughness and better layer adhesion. Low shrinkage and excellent dimensional accuracy. Compatible with all FDM 3D printers. Available in multiple colors.",
      images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800"],
      categorySlug: "3d-printing",
      mrp: 1499,
      sellingPrice: 1199,
      stock: 300,
      isActive: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Material", value: "PLA+" },
            { key: "Diameter", value: "1.75mm ±0.02mm" },
            { key: "Weight", value: "1 kg" },
            { key: "Print Temp", value: "190-220°C" },
            { key: "Bed Temp", value: "50-60°C" },
          ],
        },
      ],
      faqs: [],
      tags: ["filament", "pla", "3d-printing", "material"],
    },
    {
      title: "3D Printer Nozzle Set - Brass 0.4mm (5 Pack)",
      slug: "3d-printer-nozzle-set",
      shortDescription: "High-quality brass nozzles for 3D printers",
      description:
        "Pack of 5 precision-machined brass nozzles. Compatible with most hotends including E3D, MK8, and others. Smooth inner walls ensure consistent extrusion and high-quality prints.",
      images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"],
      categorySlug: "3d-printing",
      mrp: 499,
      sellingPrice: 349,
      stock: 200,
      isActive: true,
      sections: [],
      faqs: [],
      tags: ["3d-printer", "nozzle", "accessories", "brass"],
    },
    {
      title: "Digital Multimeter with Auto-Ranging",
      slug: "digital-multimeter-auto-ranging",
      shortDescription: "Professional multimeter for electronics work",
      description:
        "Accurate and reliable digital multimeter with auto-ranging feature. Measure voltage, current, resistance, capacitance, frequency, and more. Large LCD display with backlight. Safety-rated for professional use.",
      images: ["https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800"],
      categorySlug: "tools",
      mrp: 2999,
      sellingPrice: 2299,
      stock: 60,
      isActive: true,
      isFeatured: true,
      sections: [
        {
          type: "bullets",
          title: "Measurements",
          items: [
            "AC/DC Voltage",
            "AC/DC Current",
            "Resistance",
            "Capacitance",
            "Frequency",
            "Diode Test",
            "Continuity",
          ],
        },
      ],
      faqs: [],
      tags: ["multimeter", "measurement", "electronics", "tool"],
    },
    {
      title: "Soldering Station with Digital Display 60W",
      slug: "soldering-station-60w",
      shortDescription: "Temperature-controlled soldering station for precision work",
      description:
        "Professional soldering station with precise temperature control. Digital LED display shows current temperature. Quick heating and excellent temperature stability. Includes soldering iron holder and cleaning sponge.",
      images: ["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800"],
      categorySlug: "tools",
      mrp: 3499,
      sellingPrice: 2799,
      stock: 40,
      isActive: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Power", value: "60W" },
            { key: "Temperature Range", value: "200-480°C" },
            { key: "Display", value: "Digital LED" },
            { key: "Voltage", value: "220V AC" },
          ],
        },
      ],
      faqs: [],
      tags: ["soldering", "tool", "electronics", "professional"],
    },
    {
      title: "Helping Hands with Magnifying Glass",
      slug: "helping-hands-magnifier",
      shortDescription: "Third hand tool with LED magnifying glass for soldering",
      description:
        "Essential tool for electronics work! Features two adjustable alligator clips, LED-illuminated magnifying glass, and heavy metal base for stability. Perfect for soldering, assembly, and inspection work.",
      images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"],
      categorySlug: "tools",
      mrp: 899,
      sellingPrice: 649,
      stock: 100,
      isActive: true,
      sections: [],
      faqs: [],
      tags: ["tool", "soldering", "helping-hands", "magnifier"],
    },
    {
      title: "Jumper Wire Set - 120 Pieces",
      slug: "jumper-wire-set-120pcs",
      shortDescription: "Assorted male-to-male, male-to-female, female-to-female wires",
      description:
        "Complete set of 120 flexible jumper wires in three types: 40x male-to-male, 40x male-to-female, 40x female-to-female. Multiple colors for easy circuit identification. 20cm length. Essential for breadboard prototyping.",
      images: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800"],
      categorySlug: "tools",
      mrp: 299,
      sellingPrice: 199,
      stock: 400,
      isActive: true,
      isBestSeller: true,
      sections: [],
      faqs: [],
      tags: ["jumper-wire", "prototyping", "breadboard", "electronics"],
    },
    {
      title: "SG90 Micro Servo Motor - 9g",
      slug: "sg90-servo-motor",
      shortDescription: "Compact servo motor for robotics projects",
      description:
        "Popular micro servo motor used in RC projects, robotics, and automation. 180-degree rotation, lightweight design, and easy to control. Compatible with Arduino, Raspberry Pi, and other controllers.",
      images: ["https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800"],
      categorySlug: "sensors",
      mrp: 199,
      sellingPrice: 99,
      stock: 600,
      isActive: true,
      isBestSeller: true,
      isOnSale: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Weight", value: "9 grams" },
            { key: "Operating Voltage", value: "4.8V - 6V" },
            { key: "Torque", value: "1.8 kg/cm @ 4.8V" },
            { key: "Speed", value: "0.1s/60° @ 4.8V" },
            { key: "Rotation", value: "180 degrees" },
          ],
        },
      ],
      faqs: [],
      tags: ["servo", "motor", "robotics", "rc"],
    },
    {
      title: "L298N Motor Driver Module Dual H-Bridge",
      slug: "l298n-motor-driver",
      shortDescription: "Control up to 2 DC motors or 1 stepper motor",
      description:
        "Popular motor driver module based on L298N chip. Can control two DC motors independently or one bipolar stepper motor. Built-in 5V regulator, LED indicators, and protection circuits. Perfect for robot cars and motor control projects.",
      images: ["https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800"],
      categorySlug: "sensors",
      mrp: 349,
      sellingPrice: 249,
      stock: 250,
      isActive: true,
      isFeatured: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Chip", value: "L298N" },
            { key: "Operating Voltage", value: "5V - 35V" },
            { key: "Max Current", value: "2A per channel" },
            { key: "Channels", value: "2 (Dual H-Bridge)" },
          ],
        },
      ],
      faqs: [],
      tags: ["motor-driver", "l298n", "robotics", "h-bridge"],
    },
    {
      title: "OLED Display 0.96 inch I2C 128x64",
      slug: "oled-display-096-i2c",
      shortDescription: "Small OLED display with high contrast and low power",
      description:
        "Compact OLED display with crisp, high-contrast visuals. Uses I2C interface requiring only 2 pins. Perfect for displaying sensor data, menus, or graphics. Works with Arduino, ESP32, Raspberry Pi, and more.",
      images: ["https://images.unsplash.com/photo-1585241936511-c07e1326f3f1?w=800"],
      categorySlug: "sensors",
      mrp: 499,
      sellingPrice: 349,
      stock: 180,
      isActive: true,
      sections: [
        {
          type: "specs",
          title: "Specifications",
          items: [
            { key: "Size", value: "0.96 inch" },
            { key: "Resolution", value: "128x64 pixels" },
            { key: "Interface", value: "I2C (SDA, SCL)" },
            { key: "Color", value: "Blue/White" },
            { key: "Voltage", value: "3.3V - 5V" },
          ],
        },
      ],
      faqs: [],
      tags: ["oled", "display", "i2c", "screen"],
    },
    {
      title: "Breadboard 830 Points with Jumper Wires",
      slug: "breadboard-830-points",
      shortDescription: "Solderless breadboard for circuit prototyping",
      description:
        "High-quality solderless breadboard with 830 tie points. Self-adhesive backing for secure mounting. Includes 65 jumper wires. Perfect for prototyping circuits without soldering. Works with DIP packages and standard component leads.",
      images: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800"],
      categorySlug: "tools",
      mrp: 399,
      sellingPrice: 249,
      stock: 300,
      isActive: true,
      sections: [],
      faqs: [],
      tags: ["breadboard", "prototyping", "electronics", "tool"],
    },
  ];

  console.log("🔄 Creating products...");
  let created = 0;

  for (const productData of products) {
    const { categorySlug, ...data } = productData;
    const category = categories.find((c) => c.slug === categorySlug);

    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        categoryId: category?.id,
        sections: JSON.stringify(data.sections),
        faqs: JSON.stringify(data.faqs),
      },
    });
    created++;
    process.stdout.write(`\r✅ Created ${created}/${products.length} products`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Admin user: admin@vyomtics.com (password: admin123)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
