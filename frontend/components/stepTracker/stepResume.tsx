// --- stepResume.tsx ---
"use client";

import { useEffect, useState } from "react";
import {
    fetchResumeUrl,
    fetchUserGoal,
    updateUserGoal,
    saveResumeFile,
} from "@/utils/api";
import { API_BASE_URL } from "@/utils/api";

export default function StepResume({ userId, onChange }: { userId: number; onChange: () => void }) {
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        fetchResumeUrl(userId)
            .then(setResumeUrl)
            .catch(() => setResumeUrl(null))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setResumeFile(file);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_BASE_URL}/extract-text`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResumeText(data.text);
            setIsNextDisabled(false);
            setShowSuccessMessage(true);
        } catch (error) {
            console.error("Error extracting text from file:", error);
        }
    };

    const handleConfirmUpload = async () => {
        if (!resumeFile) return;

        try {
            const goal = await fetchUserGoal(userId);
            goal.resume_text = resumeText;
            await updateUserGoal(userId, goal);
            await saveResumeFile(userId, resumeFile);
            fetchResumeUrl(userId)
                .then(setResumeUrl)
                .catch(() => setResumeUrl(null));

            setShowSuccessMessage(false);
            setIsNextDisabled(true);
            if (onChange) onChange();
        } catch (error) {
            console.error("Error updating goal:", error);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-300 p-10">Loading resume...</div>;
    }

    if (!resumeUrl) {
        return (
            <div className="mt-10 flex flex-col items-center justify-center w-[95%] h-[65vh] aspect-[595/600] mx-auto border-2 border-dashed border-gray-400 rounded-lg text-indigo-200 text-lg p-6 space-y-4">
                <div className="text-xl">No resume uploaded yet.</div>

                <label className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white">
                    Upload Resume
                    <input
                        id="resumeUploadInput"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>

                {showSuccessMessage && resumeFile && (
                    <p className="text-green-400">✔ {resumeFile.name} uploaded successfully!</p>
                )}

                <p className="text-sm text-gray-400">Accepted format: PDF</p>
                <button
                    onClick={handleConfirmUpload}
                    className={`px-4 py-2 rounded-lg text-white ${isNextDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"}`}
                    disabled={isNextDisabled}
                >
                    Confirm
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="mb-5 pt-2 px-3">
                <div className="flex items-start justify-between w-full">
                    <h2 className="text-3xl font-bold text-indigo-200">Resume Preview</h2>

                    <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-3">
                            <label className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold">
                                Update Resume
                                <input
                                    id="resumeUploadInput"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            <button
                                onClick={handleConfirmUpload}
                                className={`px-4 py-2 rounded-lg font-semibold ${isNextDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"}`}
                                disabled={isNextDisabled}
                            >
                                Confirm
                            </button>
                        </div>

                        {showSuccessMessage && resumeFile && (
                            <p className="text-green-400 text-sm">✔ {resumeFile.name} uploaded successfully!</p>
                        )}
                    </div>
                </div>
            </div>

            <iframe
                src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=124`}
                className="w-full h-full shadow-md"
                style={{
                    border: "none",
                    margin: 0,
                    padding: 0,
                    height: "65vh",
                }}
                title="Resume Preview"
            />
        </div>
    );
}
