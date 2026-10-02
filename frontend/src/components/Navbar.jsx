import { useNavigate } from "react-router-dom";

const Navbar = () => {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true
        });
    };

    return (

        <nav className="navbar">

            <div className="navbar-brand">
                🤖 AI Policy Assistant
            </div>

            <div className="navbar-right">

                {user && (
                    <div className="user-info">

                        <span>
                            {user.email}
                        </span>

                        <span className="role-badge">
                            {user.role}
                        </span>

                    </div>
                )}

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
};

export default Navbar;