import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar"

const EmployeeDashboard = () => {

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [sources, setSources] = useState([]);
    const [asking, setAsking] = useState(false);


    // Fetch policies
    const fetchPolicies = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/policies",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPolicies(
                response.data.policies || []
            );

        } catch (error) {

            console.error(
                "Failed to fetch policies:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchPolicies();

    }, []);


    // Download policy
    const handleDownload = async (policy) => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                `/policies/${policy._id}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                policy.fileName
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "Download error:",
                error
            );

            alert("Failed to download policy");

        }
    };


    // Ask AI
    const handleAskAI = async (e) => {

        e.preventDefault();

        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        try {

            setAsking(true);

            setAnswer("");
            setSources([]);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/ai/search",
                {
                    question: question
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "AI response:",
                response.data
            );

            setAnswer(
                response.data.answer
            );

            setSources(
                response.data.sources || []
            );

        } catch (error) {

            console.error(
                "AI error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to get AI answer"
            );

        } finally {

            setAsking(false);

        }
    };


    return (

        <div>
            <Navbar />
            <main className="dashboard-container">
            <h1>
                Employee Dashboard
            </h1>

            <p>
                Welcome to the Employee Dashboard.
            </p>

            <hr />


            {/* Policies */}

            <h2>
                Company Policies
            </h2>


            {loading ? (

                <p>
                    Loading policies...
                </p>

            ) : policies.length === 0 ? (

                <p>
                    No company policies available.
                </p>

            ) : (

                <div>

                    {policies.map((policy) => (

                        <div
                            key={policy._id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "15px",
                                marginBottom: "10px"
                            }}
                        >

                            <h3>
                                {policy.title}
                            </h3>

                            <p>
                                File: {policy.fileName}
                            </p>

                            <p>
                                Status: {policy.status}
                            </p>

                            <button
                                onClick={() =>
                                    handleDownload(policy)
                                }
                            >
                                Download PDF
                            </button>

                        </div>

                    ))}

                </div>

            )}


            <hr />


            {/* AI Section */}

            <h2>
                Ask AI About Company Policies
            </h2>

            <p>
                Ask questions about company policies
                and get answers based only on
                available policy documents.
            </p>


            <form onSubmit={handleAskAI}>

                <input
                    type="text"
                    placeholder="Example: How many casual leaves do employees get?"
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                    style={{
                        width: "400px",
                        padding: "10px"
                    }}
                />

                <button
                    type="submit"
                    disabled={asking}
                    style={{
                        marginLeft: "10px"
                    }}
                >

                    {asking
                        ? "Thinking..."
                        : "Ask AI"}

                </button>

            </form>


            {/* AI Answer */}

            {answer && (

                <div
                    style={{
                        marginTop: "20px",
                        border: "1px solid #ccc",
                        padding: "20px"
                    }}
                >

                    <h3>
                        AI Answer
                    </h3>

                    <p>
                        {answer}
                    </p>


                    {/* Sources */}

                    {sources.length > 0 && (

                        <div>

                            <h4>
                                Sources
                            </h4>

                            {sources.map(
                                (source, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            marginBottom: "8px"
                                        }}
                                    >

                                        <strong>
                                            {source.policyTitle}
                                        </strong>

                                        <span>
                                            {" "}— Chunk{" "}
                                            {source.chunkIndex}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            )}
</main>
        </div>
        
    );
};

export default EmployeeDashboard;