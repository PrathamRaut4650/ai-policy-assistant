import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

const HRDashboard = () => {

    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const [policies, setPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

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

            console.log("Policies:", response.data);

            setPolicies(response.data.policies || []);

        } catch (error) {

            console.error(
                "Failed to fetch policies:",
                error
            );

        } finally {

            setLoadingPolicies(false);

        }
    };

    // Fetch policies when page loads
    useEffect(() => {
        fetchPolicies();
    }, []);


    // Upload policy
    const handleUpload = async (e) => {

        e.preventDefault();

        if (!title || !file) {
            alert("Please enter a title and select a PDF");
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("policy", file);

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            await api.post(
                "/policies/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Policy uploaded successfully!");

            setTitle("");
            setFile(null);

            document.getElementById(
                "policyFile"
            ).value = "";

            // Refresh policy list
            fetchPolicies();

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Policy upload failed"
            );

        } finally {

            setLoading(false);

        }
    };
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

        // Create downloadable file
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


    return (

        <div>
            <Navbar />
            <main className="dashboard-container">
            <h1>HR Dashboard</h1>

            <p>
                Welcome to the HR Dashboard.
            </p>

            <hr />


            {/* Upload Section */}

            <h2>Upload Company Policy</h2>

            <form onSubmit={handleUpload}>

                <div>

                    <label>
                        Policy Title
                    </label>

                    <br />

                    <input
                        type="text"
                        placeholder="Enter policy title"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                    />

                </div>

                <br />

                <div>

                    <label>
                        Policy PDF
                    </label>

                    <br />

                    <input
                        id="policyFile"
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                            setFile(
                                e.target.files[0]
                            )
                        }
                    />

                </div>

                <br />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Uploading..."
                        : "Upload Policy"}
                </button>

            </form>


            <hr />


            {/* Policy List */}

            <h2>Company Policies</h2>

            {loadingPolicies ? (

                <p>
                    Loading policies...
                </p>

            ) : policies.length === 0 ? (

                <p>
                    No policies available.
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
    onClick={() => handleDownload(policy)}
>
    Download PDF
</button>

                        </div>

                    ))}

                </div>

            )}
            </main>

        </div>
    );
};

export default HRDashboard;