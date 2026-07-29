import { config } from "dotenv";
config({ path: ".env" }); // Load API key from .env

import { generateProfile } from "../services/ai/diagnostic";
import { generateCurriculum } from "../services/ai/curriculum";
import { generateLesson } from "../services/ai/lesson";

async function main() {
  try {
    console.log("--- 1. Testing Diagnostic Profile Generation ---");
    const history = [
      { role: "user", content: "I'm interested in digital marketing, but I don't know much about data." },
      { role: "model", content: "That's a great start! Digital marketing relies heavily on data. Are you more interested in content creation, or analyzing campaign performance?" },
      { role: "user", content: "Mainly content creation, but I know I should learn how to measure if my content is actually working." },
    ];
    
    console.log("Generating profile...");
    const onboardingData = {
      name: "Tabe",
      currentCareer: "Marketing Major",
      skillToLearn: "Data Analytics",
      currentLevel: "Beginner",
      timeline: "1 month",
    };
    const profile = await generateProfile(history, onboardingData);
    console.log(JSON.stringify(profile, null, 2));

    console.log("\n--- 2. Testing Curriculum Generation ---");
    console.log("Generating curriculum based on profile...");
    const curriculum = await generateCurriculum(profile);
    console.log(JSON.stringify(curriculum, null, 2));

    console.log("\n--- 3. Testing Lesson Generation ---");
    if (curriculum.length > 0) {
      const firstModule = curriculum[0];
      console.log(`Generating lesson for module: "${firstModule.title}"...`);
      const lesson = await generateLesson(firstModule, profile);
      console.log(JSON.stringify(lesson, null, 2));
    }

    console.log("\n✅ All AI contracts generated valid JSON successfully!");

  } catch (error) {
    console.error("\n❌ Error generating AI content:", error);
  }
}

main();
