Technical Specification: Pahampajak Online Tryout Application
Version: 1.1 (Admin & User Flow Definition)
Date: October 15, 2025
1. Introduction
This document outlines the detailed technical specification for the Pahampajak Online Tryout Application. The primary objective is to build a secure, robust, and scalable online examination platform specifically tailored for tax education. This application serves as a foundational component of the larger "PahamPajak" portal, aiming to provide a reliable and cheat-resistant environment for users to test their knowledge.
The initial development phase focuses exclusively on the Admin Panel. This strategic decision is based on the principle of building a content-first application; a powerful and intuitive administrative backend is essential before any user-facing features can be effectively implemented. This specification details the complete administrative workflow, from secure authentication and granular role-based access control (RBAC) to the full lifecycle management (CRUD) of exams and their corresponding questions. The architecture described herein reflects the current, stable version of the admin-facing module, built with best practices for security and maintainability.
2. Core Features (Admin Panel)
The admin panel is engineered to provide administrators with complete control over the examination content and platform integrity. The features are designed to be intuitive, secure, and efficient.
●	Secure Authentication & Authorization:
○	Dedicated Login Portal: A specific route (/login) is provided for administrative access. User authentication is handled by Supabase Auth, ensuring industry-standard security for password hashing and session management.
○	Role-Based Access Control (RBAC): The system's security is architected around a strict RBAC model. Access to the entire admin panel (routes prefixed with /admin) is programmatically restricted. A ProtectedRoute component intercepts navigation attempts, validates the user's session, and queries the profiles table to confirm their role is admin. If the user is not authenticated or their role is not admin, they are immediately and automatically redirected to the login page.
○	Persistent Sessions: User sessions are securely persisted in the browser's local storage. A checkUser function is invoked on application startup to re-validate any existing session, allowing admins to remain logged in even after refreshing the page or closing the browser tab, providing a seamless user experience.
●	Exam Management (Full CRUD):
○	Create: Admins can create new exams via a dedicated form (/admin/exams/new). The form includes fields for essential metadata such as title, description, duration_in_minutes, and passing_score. This operation creates a new record in the exams table.
○	Read: The central exam management dashboard (/admin/exams) displays all exams in a tabular format, sorted chronologically by their creation date (created_at) to maintain a stable and predictable order. Key information like title and publication status is visible at a glance.
○	Update: Admins can edit the metadata of any existing exam by clicking an "Edit Info" link. This action navigates them to the same ExamFormPage component, which intelligently pre-fills the form with the existing exam data fetched by its unique ID from the URL.
○	Delete: Admins can permanently delete an exam. To prevent accidental data loss, this action is protected by a confirmation modal. Upon confirmation, the corresponding exam record is deleted from the database.
○	Live Publishing: A key feature is the ability to manage exam visibility in real-time. A ToggleSwitch component is rendered next to each exam in the list. Clicking this switch triggers an asynchronous update mutation that changes the is_published boolean in the database. Thanks to TanStack Query's automatic refetching, the UI updates instantly to reflect the new status (Draft or Published) without requiring a page reload.
●	Question Management (Full CRUD):
○	Dedicated Management Context: From the exam list, admins can navigate to a dedicated page (/admin/exams/:id/questions) to manage questions for a single, specific exam.
○	Create: A modal form (QuestionFormModal) allows for the creation of new questions. The form includes fields for the question text, an optional explanation, and four answer options. Radio buttons are used to designate exactly one option as the correct answer. This entire operation is handled atomically by a single create_question_with_options RPC function in the database, ensuring that a question is never created without its corresponding options.
○	Read: All questions for the selected exam are listed sequentially. The UI clearly displays the question text, all its options, and visually highlights the is_correct answer (e.g., in green text), allowing for quick administrative review and verification.
○	Update: Admins can edit any existing question by clicking an "Edit" button. This action opens the same QuestionFormModal, which detects that it's in "edit mode" and pre-fills all fields with the existing data of that question and its options. The underlying database operation is handled by the update_question_with_options RPC function.
○	Delete: Admins can permanently delete a question. This action is also protected by a confirmation modal. The delete_question RPC function handles the deletion, and the ON DELETE CASCADE constraint on the question_options table ensures that all associated answer options are automatically and cleanly removed from the database.
3. User Flows
This section details the distinct user journeys for both administrators and regular users (students).
3.1 Admin User Flow
The intended journey for an administrative user is designed to be logical, efficient, and secure, ensuring a clear separation of concerns at each step.
1.	Login: The user navigates to the application's root URL and is presented with the Admin Login page. Any attempt to access a protected admin route directly will also redirect them here.
2.	Authentication: Upon submitting valid credentials (email and password), the system performs two critical checks: first, it authenticates the user against the auth.users table. If successful, it then performs a second query to the public.profiles table to fetch the user's assigned role. Only if the role is confirmed as admin is the user redirected to the Admin Dashboard (/admin).
3.	Navigation & Layout: The user is greeted by the main admin layout. This consists of a persistent sidebar for primary navigation (Dashboard, Manage Exams) and a header displaying the currently logged-in admin's email and a prominent "Logout" button. The main content area is where the different pages are rendered.
4.	Exam Management:
○	The user clicks "Manage Exams" to navigate to the ExamListPage, which fetches and displays all exams from the database.
○	To create, they click "+ Add New Exam," which takes them to the ExamFormPage. Upon successful submission, they are programmatically redirected back to the exam list, and the newly created exam appears at the bottom of the list.
○	To edit, they click "Edit Info" on a specific exam row. This takes them to the ExamFormPage, with the URL now containing the exam's ID (e.g., /admin/exams/:id/edit). The form component uses this ID to fetch and pre-populate the fields with the existing exam data.
○	To publish an exam, the admin simply clicks the toggle switch in the "Status" column. The UI provides immediate feedback, and the change is persisted in the background.
○	To delete, they click "Delete," which opens a ConfirmationModal. This two-step process prevents accidental deletions.
5.	Question Management:
○	From the exam list, the user clicks "Manage Questions." This navigates them to the QuestionListPage, which is context-aware via the exam ID in the URL (e.g., /admin/exams/:id/questions). The page fetches and displays the exam's title and its list of questions.
○	To create a question, they click "+ Add New Question," opening the QuestionFormModal. This modal operates as an overlay, keeping the user in the context of the question list. Upon saving, the modal closes, and the list behind it automatically refreshes to include the new question.
○	To edit a question, they click "Edit" on a specific question item. The same QuestionFormModal opens, but it's pre-filled with the selected question's data, allowing for in-place editing.
○	To delete a question, they click "Delete" and confirm the action in the modal. The question is then removed from the list.
6.	Logout: At any point, the user can click the "Logout" button in the header. This terminates their session securely and redirects them back to the Admin Login page.
3.2 User (Student) Flow
This flow outlines the journey for a regular user taking an exam.
1.	Login: The user logs in via a dedicated student login page. Authentication is handled by Supabase Auth.
2.	Exam Dashboard: After logging in, the user is directed to their dashboard. The dashboard displays a list of available exams.
3.	Exam Visibility: The list of exams is not static. It is dynamically filtered based on the packages the user has purchased. This information is stored in the profiles table. The application will only show is_published = true exams that correspond to the user's entitlements.
4.	Starting an Exam:
○	When the user clicks "Start Exam," the frontend triggers a create_exam_session function.
○	This function creates a new row in the exam_sessions table. started_at is set to the current time, and expires_at is calculated based on the exam's duration_in_minutes.
○	The application navigates to the exam interface, fetching the questions and options for that exam_id. The options are presented in a randomized order. The is_correct data is never sent to the client.
5.	Answering Questions:
○	As the user answers each question, their selections are saved periodically to the user_answers JSONB column in the exam_sessions table. This prevents data loss from network issues or accidental page refreshes.
○	A server-authoritative timer counts down from the expires_at timestamp.
6.	Submitting the Exam:
○	When the user clicks "Submit" or the timer expires, the frontend calls a finalize_exam_session RPC function, passing the session_id.
○	This secure, backend function performs the scoring by comparing the user_answers with the correct options in the question_options table.
○	It then creates a permanent record in the exam_results table, containing the final score, statistics, and a detailed breakdown of answers.
○	Finally, it updates the exam_sessions status to completed.
7.	Viewing Results:
○	The user is immediately redirected to a results page.
○	This page fetches data from the exam_results table to display the score, time taken, number of correct answers, and a question-by-question review, including the explanation for each question.
4. Tech Stack
The technology stack was chosen to prioritize developer productivity, security, and scalability, leveraging modern, open-source tools.
●	Frontend Framework: React 18 with TypeScript
○	Rationale: React's component-based architecture is ideal for building a modular and maintainable UI. TypeScript adds a crucial layer of type safety, reducing runtime errors and improving code quality and developer confidence, which is essential for a complex application.
●	Build Tool: Vite
○	Rationale: Vite provides a significantly faster development experience compared to traditional bundlers. Its native ES module support and extremely fast Hot Module Replacement (HMR) allow for near-instant feedback during development.
●	Styling: Tailwind CSS
○	Rationale: The utility-first approach of Tailwind CSS enables rapid prototyping and consistent UI development without writing custom CSS. It allows us to build complex, responsive layouts directly within the component markup.
●	State Management: Zustand
○	Rationale: Zustand offers a simple, lightweight, and unopinionated approach to global state management. It provides the necessary tools for managing auth and session state without the boilerplate and complexity of more traditional solutions like Redux.
●	Data Fetching & Caching: TanStack Query (React Query)
○	Rationale: This library is the industry standard for managing server state in React applications. It elegantly handles data fetching, caching, automatic refetching, and UI state management (loading, error states), drastically simplifying data-driven components and improving performance.
●	Backend Platform: Supabase (Backend-as-a-Service)
○	Rationale: Supabase provides a comprehensive suite of backend tools built on top of PostgreSQL. This "BaaS" model dramatically accelerates development by providing a ready-to-use, scalable database, a secure authentication service, and auto-generated APIs, allowing the team to focus on frontend and business logic.
●	Database: PostgreSQL
○	Rationale: As the foundation of Supabase, PostgreSQL is a highly robust, scalable, and feature-rich open-source relational database. Its advanced features, particularly Row Level Security (RLS) and the ability to write custom Functions (RPCs), are cornerstones of this application's security architecture.
●	Core Supabase Features:
○	Supabase Auth: Provides a complete solution for user management, authentication, and session handling.
○	Row Level Security (RLS): Allows for the definition of fine-grained data access policies directly in the database, ensuring that users can only ever access data they are permitted to see. This is a security-first approach.
○	PostgreSQL Functions (RPC): Enables the encapsulation of complex business logic (like creating a question with its options) into secure, atomic database operations that can be called from the frontend.
●	Development Workflow:
○	Local-First: The entire Supabase stack (PostgreSQL, Auth, etc.) runs inside Docker containers on the local machine via the Supabase CLI. This ensures a consistent and isolated development environment.
○	Database Migrations: All changes to the database schema and functions are defined in version-controlled SQL files. This practice of "database as code" ensures that the database structure is reproducible, auditable, and can be deployed to production environments reliably.
5. Database Schema
The database consists of the following core tables, managed via SQL migrations.
public.profiles
Stores public user data and application-specific roles, linked 1-to-1 with auth.users. This separation is a best practice, keeping the core authentication table clean while allowing the application's user model to evolve.
Column Name	Data Type	Constraints	Description
id	uuid	PK, FK -> auth.users.id	The user's unique ID from the auth.users table.
username	text	UNIQUE	A unique, user-chosen username.
full_name	text		The user's display name.
role	user_role (ENUM)	NOT NULL, DEFAULT 'user'	User role, restricted to admin or user for data integrity.
purchased_packages	text[]		An array of identifiers for purchased exam packages.
created_at	timestamptz	NOT NULL, DEFAULT now()	Timestamp of when the profile was created.
updated_at	timestamptz	NOT NULL, DEFAULT now()	Timestamp of the last profile update.
public.exams
The master table for all exams (tryouts). It contains all the metadata required to define an examination session.
Column Name	Data Type	Constraints	Description
id	uuid	PK, DEFAULT gen_random_uuid()	Unique identifier for the exam.
title	text	NOT NULL	The public title of the exam.
description	text		A brief description, potentially shown to users before starting.
duration_in_minutes	integer	NOT NULL	The time limit for the exam.
is_published	boolean	NOT NULL, DEFAULT false	A critical flag that toggles visibility for end-users.
passing_score	integer	NOT NULL, DEFAULT 70	The percentage score required to pass the exam.
max_attempts	integer	DEFAULT 1	Controls how many times a user can take this exam.
package_id	text		Identifier linking this exam to a purchasable package.
author_id	uuid	FK -> auth.users.id	The admin who created or last modified the exam.
created_at	timestamptz	NOT NULL, DEFAULT now()	Timestamp of creation for chronological sorting.
updated_at	timestamptz	DEFAULT now()	Timestamp of the last update.
public.questions
Stores the individual questions for each exam. This table holds the core intellectual property of the platform.
Column Name	Data Type	Constraints	Description
id	uuid	PK, DEFAULT gen_random_uuid()	Unique ID for the question.
exam_id	uuid	NOT NULL, FK -> exams.id	The exam this question is a part of. ON DELETE CASCADE.
question_text	text	NOT NULL	The actual text/body of the question.
explanation	text		An explanation for the correct answer, shown after the exam.
order	integer		A number used to enforce a specific sequence for questions.
created_at	timestamptz	NOT NULL, DEFAULT now()	Timestamp of creation.
public.question_options
Stores the set of possible answers for each question. The security of this table is paramount.
Column Name	Data Type	Constraints	Description
id	uuid	PK, DEFAULT gen_random_uuid()	Unique ID for the option.
question_id	uuid	NOT NULL, FK -> questions.id	The question this option belongs to. ON DELETE CASCADE.
option_text	text	NOT NULL	The text displayed for this answer option.
is_correct	boolean	NOT NULL	The critical flag indicating the correct answer. Access is restricted via RLS.
created_at	timestamptz	NOT NULL, DEFAULT now()	Timestamp of creation.
Other tables defined in the initial schema (exam_sessions, exam_results) are reserved for the user-facing exam-taking functionality and are not yet utilized by the admin panel.
6. API Endpoints (PostgreSQL Functions)
Instead of traditional REST endpoints, the application logic is encapsulated within PostgreSQL Functions (RPCs) for enhanced security and atomicity. The frontend calls these functions via the Supabase client library.
●	public.create_question_with_options(exam_id_in, question_text_in, explanation_in, options_in)
○	Description: Atomically creates a new question and all of its associated answer options in a single database transaction. This is critical for data integrity, as it prevents the creation of "orphaned" questions without answers.
○	Parameters: Exam ID, question text, explanation text, and an array of option_input types.
○	Returns: The uuid of the newly created question.
○	Security: Runs with SECURITY DEFINER to bypass RLS for this specific, controlled transaction.
●	public.update_question_with_options(question_id_in, question_text_in, explanation_in, options_in)
○	Description: Atomically updates a question's text and explanation, and replaces its old answer options with a new set.
○	Parameters: Question ID, new question text, new explanation, and a new array of option_input types.
○	Returns: void.
○	Security: Runs with SECURITY DEFINER.
●	public.delete_question(question_id_in)
○	Description: Deletes a specific question. The real power lies in the ON DELETE CASCADE constraint defined on the question_options table's foreign key. When this function deletes a question, the database automatically deletes all of its child options.
○	Parameters: The uuid of the question to be deleted.
○	Returns: void.
○	Security: Runs with SECURITY DEFINER.
●	public.get_my_role()
○	Description: A crucial helper function used within various RLS policies. It provides a secure and reusable way to check the role of the currently authenticated user by querying the profiles table. This prevents duplicating logic across multiple policies.
○	Returns: The calling user's user_role (admin or user).
○	Security: Runs with SECURITY DEFINER to ensure it can read the role from the profiles table even if the user doesn't have direct select permissions on it.
●	public.finalize_exam_session(session_id_in)
○	Description: A secure function to finalize an exam session. It calculates the score, creates a permanent record in exam_results, and updates the session status. This prevents any client-side score manipulation.
○	Parameters: The uuid of the session to be finalized.
○	Returns: The final calculated score.
