import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing records (Optional, clean up in reverse relation dependency order)
  await prisma.userBadge.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.rewardRedemption.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.rewardStoreItem.deleteMany({});

  await prisma.attendanceRecord.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared old database records.");

  // 2. Hash default password
  const passwordHash = await bcrypt.hash("password123", 10);

  // 3. Seed Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@campus.edu",
      passwordHash,
      firstName: "System",
      lastName: "Admin",
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: "prof.sharma@campus.edu",
      passwordHash,
      firstName: "Dr. Priya",
      lastName: "Sharma",
      role: "TEACHER",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "sohan.k@campus.edu",
      passwordHash,
      firstName: "Sohan",
      lastName: "kumar kj",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "chloe.b@campus.edu",
      passwordHash,
      firstName: "Chloe",
      lastName: "Bennett",
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: "elena.r@campus.edu",
      passwordHash,
      firstName: "Elena",
      lastName: "Rostova",
      role: "STUDENT",
    },
  });

  console.log("Seeded basic accounts (Admin, Teacher, 3 Students).");

  // 4. Seed Departments
  const cseDept = await prisma.department.create({
    data: { name: "Computer Science & Engineering", code: "CSE" },
  });

  const eeDept = await prisma.department.create({
    data: { name: "Electrical Engineering", code: "EE" },
  });

  const physicsDept = await prisma.department.create({
    data: { name: "Applied Physics", code: "PHYS" },
  });

  console.log("Seeded departments (CSE, EE, Physics).");

  // 5. Seed Courses
  const courseCS = await prisma.course.create({
    data: {
      code: "CS-301",
      name: "Software Engineering Principles",
      credits: 4,
      departmentId: cseDept.id,
    },
  });

  const courseEE = await prisma.course.create({
    data: {
      code: "EE-202",
      name: "Signals and Systems",
      credits: 3,
      departmentId: eeDept.id,
    },
  });

  console.log("Seeded courses (CS-301, EE-202).");

  // 6. Seed Section
  const sectionCS = await prisma.section.create({
    data: {
      name: "Section A",
      courseId: courseCS.id,
      instructorId: teacher.id,
      semester: "SPRING",
      year: 2026,
    },
  });

  const sectionEE = await prisma.section.create({
    data: {
      name: "Section B",
      courseId: courseEE.id,
      instructorId: teacher.id,
      semester: "SPRING",
      year: 2026,
    },
  });

  console.log("Seeded course sections.");

  // 7. Seed Enrollments
  await prisma.enrollment.createMany({
    data: [
      { studentId: student.id, sectionId: sectionCS.id },
      { studentId: student2.id, sectionId: sectionCS.id },
      { studentId: student3.id, sectionId: sectionCS.id },
      { studentId: student.id, sectionId: sectionEE.id },
    ],
  });

  console.log("Enrolled students in sections.");

  // 8. Seed Schedules
  await prisma.schedule.create({
    data: {
      sectionId: sectionCS.id,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:30",
      room: "LHC-102",
    },
  });

  await prisma.schedule.create({
    data: {
      sectionId: sectionEE.id,
      dayOfWeek: "WEDNESDAY",
      startTime: "11:00",
      endTime: "12:30",
      room: "LHC-204",
    },
  });

  console.log("Seeded class schedules.");

  // 9. Seed Lectures & Historical Attendance
  // Create 10 past lectures for CS-301
  const baseDate = new Date();
  for (let i = 1; i <= 10; i++) {
    const lectureDate = new Date(baseDate);
    lectureDate.setDate(baseDate.getDate() - (11 - i)); // Past 10 days

    const lecture = await prisma.lecture.create({
      data: {
        sectionId: sectionCS.id,
        dateTime: lectureDate,
        topic: `Topic ${i}: Chapter Overview`,
        status: "COMPLETED",
      },
    });

    // Mark attendance logs for student 1 (Sohan kumar kj - present mostly)
    await prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        lectureId: lecture.id,
        status: i === 3 ? "ABSENT" : i === 7 ? "LATE" : "PRESENT",
        markedById: teacher.id,
        verificationMethod: "QR",
      },
    });

    // Mark student 2 (Chloe Bennett - at risk, warning level)
    await prisma.attendanceRecord.create({
      data: {
        studentId: student2.id,
        lectureId: lecture.id,
        status: i % 3 === 0 ? "ABSENT" : "PRESENT",
        markedById: teacher.id,
        verificationMethod: "MANUAL",
      },
    });

    // Mark student 3 (Elena Rostova - high absent)
    await prisma.attendanceRecord.create({
      data: {
        studentId: student3.id,
        lectureId: lecture.id,
        status: i > 5 ? "ABSENT" : "PRESENT",
        markedById: teacher.id,
        verificationMethod: "GEOLOCATION",
      },
    });
  }

  console.log("Seeded historical lecture logs & attendance registers.");

  // 10. Seed Badges
  console.log("Seeding Badges...");
  const badgesData = [
    { name: "Early Bird", description: "Checked in to a lecture within the first 2 minutes of the session starting.", icon: "Zap", xpReward: 50, category: "ATTENDANCE" },
    { name: "Perfect Week", description: "Maintained a perfect 5-lecture attendance streak.", icon: "Flame", xpReward: 100, category: "ATTENDANCE" },
    { name: "Campus Connector", description: "Registered and participated in 3 campus events.", icon: "Users", xpReward: 75, category: "EVENT" },
    { name: "Academic Loyalist", description: "Attended 10 lectures continuously without absence.", icon: "Award", xpReward: 150, category: "ATTENDANCE" },
    { name: "Smart Planner", description: "Synced and customized timetable preferences with AI Co-Pilot.", icon: "Target", xpReward: 50, category: "ENGAGEMENT" }
  ];

  for (const b of badgesData) {
    await prisma.badge.create({ data: b });
  }

  // 11. Seed Achievements
  console.log("Seeding Achievements...");
  const achievementsData = [
    { name: "Streak Pioneer", description: "Reach a current attendance streak of 5 lectures.", targetType: "STREAK", targetValue: 5, pointsReward: 100 },
    { name: "Lecture Loyalist", description: "Attend a total of 10 lecture sessions.", targetType: "CLASSES_ATTENDED", targetValue: 10, pointsReward: 150 },
    { name: "Seminar Explorer", description: "Register for at least 2 guest seminars.", targetType: "EVENTS_ATTENDED", targetValue: 2, pointsReward: 75 }
  ];

  for (const a of achievementsData) {
    await prisma.achievement.create({ data: a });
  }

  // 12. Seed Reward Store Items
  console.log("Seeding Reward Store Items...");
  const storeItemsData = [
    { title: "Attendance Waiver Ticket", description: "One-time attendance excuse voucher for any course lecture. Restores PRESENT status on request.", costPoints: 500, category: "ACADEMIC", quantity: 50 },
    { title: "Central Cafe Free Coffee", description: "Redeemable for one premium hot coffee or iced tea at the Central Campus Cafe.", costPoints: 150, category: "LIFESTYLE", quantity: 150 },
    { title: "Library Priority Research Pass", description: "Grants 7-day exclusive reserve privileges on private research study cabins in the Central Library.", costPoints: 300, category: "ACADEMIC", quantity: 30 },
    { title: "SCAAS Premium Hoodie", description: "Official SCAAS branded glassmorphic black varsity hoodie.", costPoints: 1200, category: "LIFESTYLE", quantity: 10 }
  ];

  for (const r of storeItemsData) {
    await prisma.rewardStoreItem.create({ data: r });
  }

  // 13. Seed Sohan (sohan.k@campus.edu) with initial XP, level, and streak for demonstration
  console.log("Seeding Sohan's initial engagement stats...");
  await prisma.user.update({
    where: { id: student.id },
    data: {
      xp: 750,
      level: 4,
      streak: 8,
      longestStreak: 12,
    }
  });

  // Assign some default achievements to Sohan
  const streakAch = await prisma.achievement.findUnique({ where: { name: "Streak Pioneer" } });
  const loyalAch = await prisma.achievement.findUnique({ where: { name: "Lecture Loyalist" } });
  if (streakAch) {
    await prisma.userAchievement.create({
      data: {
        userId: student.id,
        achievementId: streakAch.id,
        progress: 5,
        isUnlocked: true,
        unlockedAt: new Date(),
      }
    });
  }
  if (loyalAch) {
    await prisma.userAchievement.create({
      data: {
        userId: student.id,
        achievementId: loyalAch.id,
        progress: 8,
        isUnlocked: false,
      }
    });
  }

  // Assign some default badges to Sohan
  const perfectBadge = await prisma.badge.findUnique({ where: { name: "Perfect Week" } });
  const smartBadge = await prisma.badge.findUnique({ where: { name: "Smart Planner" } });
  if (perfectBadge) {
    await prisma.userBadge.create({
      data: {
        userId: student.id,
        badgeId: perfectBadge.id,
        earnedAt: new Date(),
      }
    });
  }
  if (smartBadge) {
    await prisma.userBadge.create({
      data: {
        userId: student.id,
        badgeId: smartBadge.id,
        earnedAt: new Date(),
      }
    });
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
