import { Job, User } from "./models/index.js";

async function fixJobsCategory() {
  try {
    console.log("Starting to fix jobs category...");
    
    // Get all jobs with their poster info
    const jobs = await Job.findAll({
      include: [
        {
          model: User,
          as: "poster",
          attributes: ["userType"]
        }
      ]
    });

    console.log(`Total jobs found: ${jobs.length}`);

    let updated = 0;

    for (const job of jobs) {
      if (!job.category || job.category === null) {
        // Set category based on poster user type
        if (job.poster && job.poster.userType === "hr_admin") {
          job.category = "municipality";
        } else if (job.poster && job.poster.userType === "dept_manager") {
          job.category = "department";
        } else {
          job.category = "department"; // default
        }

        await job.save();
        updated++;
        console.log(`Updated: ${job.title} -> ${job.category}`);
      } else {
        console.log(`Already has category: ${job.title} -> ${job.category}`);
      }
    }

    console.log(`\n✅ Fixed ${updated} jobs with category`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixJobsCategory();
