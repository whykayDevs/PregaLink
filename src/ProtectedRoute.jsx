
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function ProtectedRoute({ children, allowedRole, requireAdmin = false }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            if (!currentUser) {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Admins are checked separately from regular users.
                if (requireAdmin) {
                    const adminDoc = await getDoc(
                        doc(db, "admins", currentUser.uid)
                    );

                    if (adminDoc.exists()) {
                        setIsAdmin(true);
                        setUser({
                            uid: currentUser.uid,
                            role: "admin",
                        });
                    } else {
                        setIsAdmin(false);
                        setUser(null);
                    }

                    setLoading(false);
                    return;
                }

                // Regular users must have a profile in "users".
                const userDoc = await getDoc(
                    doc(db, "users", currentUser.uid)
                );

                if (userDoc.exists()) {
                    const data = userDoc.data();

                    setUser({
                        uid: currentUser.uid,
                        role: data.role,
                        verificationStatus: data.verificationStatus,
                        verificationSubmittedAt: data.verificationSubmittedAt,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Unable to verify access:", error);
                setUser(null);
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, [requireAdmin]);

    if (loading) {
        return <p>Checking access...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    if (
        allowedRole === "doctor" &&
        user.verificationStatus !== "approved"
    ) {
        if (!user.verificationSubmittedAt) {
            return <Navigate to="/professional-verification" replace />;
        }

        return <Navigate to="/verification-pending" replace />;
    }

    return children;
}

export default ProtectedRoute;
