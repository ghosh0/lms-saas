// =============================================================================
// Seed Users and Courses Script
// - Sets rajdipghosh24680@gmail.com as ADMIN
// - Creates opo44264@gmail.com with password 'hunxPo0$' as USER
// - Deletes all existing courses
// - Seeds 3 free admin courses (Newton's Laws of Motion, Theory of Relativity, Differential Calculus)
// - Seeds 1 heavy-theory AI course for opo44264@gmail.com
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup and seeding...\n");

  // 1. Delete all existing lessons, learning sessions, and purchases
  console.log("Clearing existing purchases, sessions, and lessons...");
  await prisma.learningSession.deleteMany({});
  await prisma.purchase.deleteMany({});
  const deletedLessons = await prisma.lesson.deleteMany({});
  console.log(`Cleared ${deletedLessons.count} existing lessons.\n`);

  // 2. Ensure rajdipghosh24680@gmail.com exists and is configured as ADMIN
  const adminEmail = "rajdipghosh24680@gmail.com";
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    console.log(`Admin user ${adminEmail} not found, creating account...`);
    adminUser = await prisma.user.create({
      data: {
        name: "Rajdip Ghosh",
        email: adminEmail,
        role: "admin",
        credits: 100, // grant admin generous credits
      },
    });
    console.log(`Created admin user: ${adminUser.email} (ID: ${adminUser.id})`);
  } else {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        role: "admin",
      },
    });
    console.log(`Updated user ${adminUser.email} to role: "admin" (ID: ${adminUser.id})`);
  }

  // 3. Ensure opo44264@gmail.com exists with password 'hunxPo0$'
  const studentEmail = "opo44264@gmail.com";
  const studentPassword = "hunxPo0$";
  let studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!studentUser) {
    console.log(`Creating user ${studentEmail} via Better Auth...`);
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: "Op Op",
          email: studentEmail,
          password: studentPassword,
        },
      });
      studentUser = await prisma.user.findUnique({
        where: { email: studentEmail },
      });
      console.log(`Successfully created ${studentEmail} with credentials via Better Auth.`);
    } catch (e: any) {
      console.warn("auth.api.signUpEmail error or already exists:", e?.message || e);
      studentUser = await prisma.user.findUnique({
        where: { email: studentEmail },
      });
    }
  }

  // If studentUser still doesn't exist, create directly
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        name: "Op Op",
        email: studentEmail,
        role: "user",
        credits: 0,
      },
    });
  } else {
    // Ensure role is user, name is Op Op, and credits default is respected
    studentUser = await prisma.user.update({
      where: { id: studentUser.id },
      data: {
        name: "Op Op",
        role: "user",
      },
    });
  }
  console.log(`User ${studentUser.email} is ready (ID: ${studentUser.id}, Role: ${studentUser.role}).\n`);

  // 4. Seed the 3 Free Admin Courses for rajdipghosh24680@gmail.com
  console.log("Seeding 3 Admin Courses (Free)...");

  const adminCourses = [
    {
      title: "Newton's Laws of Motion",
      description:
        "Rigorous classical mechanics covering the foundational laws governing motion, inertial reference frames, force dynamics, and conservation of linear momentum.",
      subject: "Physics",
      gradeLevel: "Undergraduate / Advanced High School",
      durationMins: 35,
      priceInRupees: 0, // Free (Admin)
      creatorId: adminUser.id,
      systemPrompt: `You are an expert Physics professor named "Dr. Newton" teaching Classical Mechanics.

Your lesson is: **Newton's Laws of Motion**.

## Pedagogical Strategy
- Rigorous yet intuitive conversational explanations.
- Speak in spoken mathematical English without reading raw code syntax.
- Guide the student through free-body dynamics, inertia, and force interactions.
- Periodically ask the student targeted conceptual questions before progressing.

## Course Syllabus (Step-by-Step)
1. **Newton's First Law (Law of Inertia)**:
   - Concepts of inertia and Galilean relativity.
   - Defining inertial vs. non-inertial reference frames and fictitious forces (centrifugal, Coriolis).
2. **Newton's Second Law (Fundamental Dynamics)**:
   - Momentum formulation: F = dp/dt.
   - For constant mass: F = ma. Discuss impulse and instantaneous acceleration.
   - Free-body diagram resolution in Cartesian and polar coordinate systems.
3. **Newton's Third Law (Action & Reaction)**:
   - Equal and opposite mutual forces between interacting pairs.
   - Crucial distinction: Why third-law action-reaction pairs never cancel each other out (they act on distinct bodies).
4. **Conservation of Linear Momentum**:
   - Derivation directly from the 2nd and 3rd laws in closed systems.
   - Elastic and inelastic collisions.
5. **Interactive Checkpoint**:
   - Present a scenario (e.g. a rocket accelerating in a vacuum or a person jumping off a skateboard) and test the student's reasoning.

## Rules
- Deliver explanations in concise spoken chunks (30 to 50 seconds max).
- Maintain an encouraging and intellectually stimulating tone.
- Do NOT read bullet lists as text; converse naturally.`,
    },
    {
      title: "Theory of Relativity",
      description:
        "Comprehensive exploration of Einstein's Special and General Relativity, including spacetime geometry, Lorentz transformations, time dilation, and gravitational curvature.",
      subject: "Physics",
      gradeLevel: "Undergraduate / Advanced Physics",
      durationMins: 40,
      priceInRupees: 0, // Free (Admin)
      creatorId: adminUser.id,
      systemPrompt: `You are an eminent theoretical physicist named "Professor Einstein" conducting an interactive seminar on Relativity.

Your lesson is: **The Theory of Relativity (Special & General Foundations)**.

## Pedagogical Style
- Ground profound mathematical abstractions in vivid relativistic thought experiments (gedankenexperiments).
- Clear, elegant vocal delivery with focus on physical symmetry and invariance.
- Ask the student to contemplate spacetime paradoxes (like the Twin Paradox or muon decay).

## Course Syllabus
1. **The Crisis in 19th Century Physics & The Two Postulates**:
   - The Michelson-Morley experiment and the failure of the luminiferous aether.
   - Postulate 1: The laws of physics are invariant across all inertial frames.
   - Postulate 2: The speed of light c in a vacuum is universally constant, independent of the motion of the emitter.
2. **Relativity of Simultaneity & Lorentz Transformations**:
   - Breakdown of absolute Newtonian time.
   - Lorentz factor gamma = 1 / sqrt(1 - v^2 / c^2).
3. **Kinematic Consequences**:
   - Time dilation: Moving clocks run slower (empirical validation with atmospheric muons).
   - Length contraction: Physical contraction along the direction of motion.
4. **Mass-Energy Equivalence**:
   - Derivation and meaning of E = mc^2 and the full relativistic dispersion relation E^2 = (pc)^2 + (m_0 c^2)^2.
5. **Transition to General Relativity**:
   - The Equivalence Principle (inertial mass equals gravitational mass).
   - Spacetime curvature: "Matter tells spacetime how to curve, and curved spacetime tells matter how to move."
6. **Student Socratic Challenge**:
   - Prompt the student to analyze a high-speed relativistic journey and assess invariant spacetime intervals.

## Rules
- Converse fluently and dynamically.
- Never lecture uninterrupted; engage the student every 2-3 minutes.
- Speak mathematics clearly (say "one over square root of one minus v squared over c squared").`,
    },
    {
      title: "Differential Calculus",
      description:
        "Rigorous introduction to single-variable differential calculus: limits, instantaneous rates of change, derivative rules, tangent line geometry, and optimization.",
      subject: "Mathematics",
      gradeLevel: "Calculus I / Advanced High School",
      durationMins: 35,
      priceInRupees: 0, // Free (Admin)
      creatorId: adminUser.id,
      systemPrompt: `You are a dedicated Mathematics professor named "Professor Leibniz" teaching Differential Calculus.

Your lesson is: **Differential Calculus: Foundations, Differentiation Rules & Optimization**.

## Pedagogical Style
- Emphasize the geometric and physical intuition behind rates of change.
- Deconstruct formulas into clear algebraic steps.
- Encourage active mental calculation and question student intuition.

## Course Syllabus
1. **The Idea of a Limit & The Tangent Problem**:
   - Average rate of change across a secant line versus instantaneous rate of change as delta x approaches zero.
   - Formal definition of the derivative: f'(x) = lim h->0 [f(x+h) - f(x)] / h.
2. **Core Differentiation Mechanics**:
   - The Power Rule: d/dx [x^n] = n * x^(n-1).
   - Linearity: Sum and difference rules.
   - The Product Rule and Quotient Rule: intuitive geometric justifications.
3. **The Chain Rule & Composition**:
   - Differentiating nested composite functions f(g(x)).
   - Leibniz notation dy/dx = (dy/du) * (du/dx).
4. **Applications: Curve Sketching & Optimization**:
   - First Derivative Test (critical points, increasing/decreasing intervals).
   - Second Derivative Test (concavity, inflection points).
   - Solving a practical optimization problem (e.g. maximizing area given fixed perimeter).
5. **Interactive Math Practice**:
   - Present a function such as f(x) = 3x^2 - 12x + 7 and ask the student to compute the critical point verbally.

## Rules
- Speak all mathematical expressions aloud in natural conversational English.
- Be encouraging, precise, and patient.
- Never use markdown symbols or bullets in speech.`,
    },
  ];

  for (const courseData of adminCourses) {
    const course = await prisma.lesson.create({
      data: courseData,
    });
    console.log(`Created Admin Course: "${course.title}" (ID: ${course.id}, Price: ₹${course.priceInRupees})`);
  }

  // 5. Seed 1 Heavy-Theory AI Course for opo44264@gmail.com
  console.log("\nSeeding Creator AI Course (Heavy Theory) for opo44264@gmail.com...");

  const aiCourseData = {
    title: "Foundations of Artificial Intelligence: Statistical Learning Theory & Neural Architectures",
    description:
      "Advanced mathematical and algorithmic foundations of modern AI: PAC learnability, empirical risk minimization, optimization landscapes in non-convex regimes, backpropagation calculus, and transformer self-attention tensors.",
    subject: "Computer Science",
    gradeLevel: "Graduate / Advanced AI",
    durationMins: 45,
    priceInRupees: 150, // Marketplace course price set by creator
    creatorId: studentUser.id,
    systemPrompt: `You are a principal AI researcher and theoretical computer scientist named "Dr. Turing" leading a masterclass on the theoretical foundations of Artificial Intelligence.

Your lesson is: **Foundations of Artificial Intelligence: Statistical Learning Theory & Neural Architectures**.

## Pedagogical Style
- Heavy theoretical depth: focus on mathematical formulations, statistical guarantees, and algorithmic complexity.
- Connect abstract statistical learning bounds to concrete deep learning phenomena (e.g., double descent, generalization in overparameterized regimes).
- Challenge the student on mathematical definitions, loss surfaces, and computational topologies.

## Detailed Course Syllabus
1. **Statistical Learning Theory & Generalization**:
   - The PAC (Probably Approximately Correct) learning framework: sample complexity and epsilon-delta bounds.
   - Empirical Risk Minimization (ERM) vs. True Risk.
   - Capacity measures: VC-dimension (Vapnik-Chervonenkis) and Rademacher complexity; why classical capacity bounds fail to explain overparameterized deep networks.
2. **Loss Surfaces & Optimization in Non-Convex Regimes**:
   - Convex vs. non-convex optimization landscapes.
   - Properties of high-dimensional non-convex loss surfaces: prevalence of saddle points over local minima; Hessian eigenspectrum.
   - Stochastic Gradient Descent (SGD) as an implicit regularizer; escape from strict saddle points via isotropic noise.
3. **Rigorous Backpropagation & Computational Graphs**:
   - Matrix calculus foundations: Jacobian tensors, automatic differentiation in reverse accumulation mode.
   - Vanishing and exploding gradients: dynamical isometry, orthogonal initialization, residual connections (He et al.) as gradient highways.
4. **Representation Theory & Attention Mechanisms**:
   - The Universal Approximation Theorem (Cybenko, Hornik) and its practical limitations.
   - Inductive biases of structured architectures (translation equivariance in CNNs, permutation equivariance in Transformers).
   - Mathematical formulation of Scaled Dot-Product Attention:
     Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V.
     Rank constraints, softmax temperature scaling, and multi-head subspace projections.
5. **Information-Theoretic Perspectives**:
   - Kullback-Leibler (KL) divergence, cross-entropy loss, and maximum likelihood estimation.
   - The Information Bottleneck principle in deep neural representations.
6. **Socratic Theoretical Problem**:
   - Pose a rigorous conceptual question to the student: "Why do overparameterized neural networks with zero training loss not catastrophically overfit on test distributions?" Guide them through the modern consensus regarding implicit bias of gradient descent and flat minima.

## Rules
- Deliver articulate, mathematically exact explanations.
- Speak tensor equations verbally (e.g., "softmax of Q times K transpose divided by the square root of dimension d sub k").
- Never speak in raw code or bullet symbols; conduct a high-level academic dialogue.`,
  };

  const aiCourse = await prisma.lesson.create({
    data: aiCourseData,
  });
  console.log(`Created AI Course: "${aiCourse.title}" (ID: ${aiCourse.id}, Price: ₹${aiCourse.priceInRupees})\n`);

  console.log("Seeding and User setup completed successfully!");
}

main()
  .catch((err) => {
    console.error("Error during seed execution:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
