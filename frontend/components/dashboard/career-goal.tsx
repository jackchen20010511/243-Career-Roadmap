"use client";

export default function CareerGoal({ jobTitle, setJobTitle, industry, setIndustry, exp_level, setExpLevel, responsibility, setResponsibility }) {
    return (
        <>
            <h2 className="mb-8 animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Your Dream Career
            </h2>
            <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Career Position</p>
            <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 text-white rounded-lg text-lg"
                placeholder="e.g. Data Analyst"
            />

            {/* Industry */}
            <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Industry</p>
            <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 text-white rounded-lg text-lg"
                placeholder="e.g. Technology, Healthcare, Finance"
            />

            {/* Experience Level */}
            <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Experience Level</p>
            <select
                value={exp_level}
                onChange={(e) => setExpLevel(e.target.value)}
                className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 text-white rounded-lg text-lg cursor-pointer"
            >
                <option value="" disabled hidden>
                    Choose Experience Level
                </option>
                <option value="" disabled hidden>Choose Experience Level</option>
                <option value="Internship">Internship</option>
                <option value="Entry level">Entry level</option>
                <option value="Mid-Senior level">Mid-Senior level</option>
                <option value="Associate">Associate</option>
                <option value="Director">Director</option>
                <option value="Executive">Executive</option>
            </select>

            <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Responsibilities (Optional but Recommended)</p>
            <textarea
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
                className="mt-2 p-4 w-full h-30 border border-gray-600 bg-gray-700 text-white rounded-lg text-lg resize-none"
                placeholder="e.g. Create data-driven insights through machine learning"
            />
        </>
    );
}
