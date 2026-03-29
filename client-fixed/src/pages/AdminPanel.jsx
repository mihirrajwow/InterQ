import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { motion } from "motion/react";
import {
    BsRobot,
    BsPeopleFill,
    BsFileEarmarkText,
    BsBarChartFill,
    BsShieldFill,
    BsTrash,
    BsSearch,
    BsChevronLeft,
    BsChevronRight,
    BsArrowLeft,
} from "react-icons/bs";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6"];

function StatCard({ icon, label, value, sub }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5"
        >
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-2xl">
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    );
}

export default function AdminPanel() {
    const { userData } = useSelector((s) => s.user);
    const navigate = useNavigate();

    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userPages, setUserPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [interviews, setInterviews] = useState([]);
    const [intTotal, setIntTotal] = useState(0);
    const [intPage, setIntPage] = useState(1);
    const [intPages, setIntPages] = useState(1);
    const [expandedUser, setExpandedUser] = useState(null);
    const [userInterviews, setUserInterviews] = useState([]);
    const [loadingUI, setLoadingUI] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [roleLoading, setRoleLoading] = useState(null);

    // Guard — only admins
    useEffect(() => {
        if (userData && userData.role !== "admin") navigate("/");
    }, [userData]);

    // Fetch stats
    useEffect(() => {
        if (tab !== "overview") return;
        axios
            .get(ServerUrl + "/api/admin/stats", { withCredentials: true })
            .then((r) => setStats(r.data))
            .catch(console.error);
    }, [tab]);

    // Fetch users
    useEffect(() => {
        if (tab !== "users") return;
        setLoadingUI(true);
        axios
            .get(
                ServerUrl +
                    `/api/admin/users?page=${userPage}&limit=15&search=${search}`,
                { withCredentials: true },
            )
            .then((r) => {
                setUsers(r.data.users);
                setUserTotal(r.data.total);
                setUserPages(r.data.pages);
            })
            .catch(console.error)
            .finally(() => setLoadingUI(false));
    }, [tab, userPage, search]);

    // Fetch all interviews
    useEffect(() => {
        if (tab !== "interviews") return;
        setLoadingUI(true);
        axios
            .get(ServerUrl + `/api/admin/interviews?page=${intPage}&limit=15`, {
                withCredentials: true,
            })
            .then((r) => {
                setInterviews(r.data.interviews);
                setIntTotal(r.data.total);
                setIntPages(r.data.pages);
            })
            .catch(console.error)
            .finally(() => setLoadingUI(false));
    }, [tab, intPage]);

    const loadUserInterviews = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }
        setExpandedUser(userId);
        const r = await axios.get(
            ServerUrl + `/api/admin/users/${userId}/interviews`,
            { withCredentials: true },
        );
        setUserInterviews(r.data);
    };

    const handleRoleChange = async (userId, newRole) => {
        setRoleLoading(userId);
        try {
            await axios.patch(
                ServerUrl + `/api/admin/users/${userId}/role`,
                { role: newRole },
                { withCredentials: true },
            );
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, role: newRole } : u,
                ),
            );
        } catch (e) {
            alert(e.response?.data?.message || "Failed to update role");
        }
        setRoleLoading(null);
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(ServerUrl + `/api/admin/users/${userId}`, {
                withCredentials: true,
            });
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            setConfirmDelete(null);
        } catch (e) {
            alert(e.response?.data?.message || "Failed to delete user");
        }
    };

    const tabs = [
        { key: "overview", label: "Overview", icon: <BsBarChartFill /> },
        { key: "users", label: "Users", icon: <BsPeopleFill /> },
        { key: "interviews", label: "Interviews", icon: <BsFileEarmarkText /> },
    ];

    if (!userData || userData.role !== "admin") return null;

    return (
        <div className="min-h-screen bg-[#f3f3f3]">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500 cursor-pointer"
                    >
                        <BsArrowLeft size={18} />
                    </button>
                    <div className="bg-black text-white p-2 rounded-lg">
                        <BsRobot size={18} />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">InterQ</h1>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <BsShieldFill size={10} /> Admin Panel
                        </p>
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    Signed in as{" "}
                    <span className="font-medium text-gray-800">
                        {userData.name}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab nav */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-2 w-fit">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer
                ${tab === t.key ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── OVERVIEW ── */}
                {tab === "overview" && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={<BsPeopleFill />}
                                label="Total Users"
                                value={stats.totalUsers}
                            />
                            <StatCard
                                icon={<BsShieldFill />}
                                label="Admins"
                                value={stats.totalAdmins}
                            />
                            <StatCard
                                icon={<BsFileEarmarkText />}
                                label="Total Interviews"
                                value={stats.totalInterviews}
                                sub={`${stats.completedInterviews} completed`}
                            />
                            <StatCard
                                icon={<BsBarChartFill />}
                                label="Avg Score"
                                value={`${stats.avgScore}/10`}
                                sub="across completed interviews"
                            />
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Daily activity */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="font-semibold text-gray-700 mb-4">
                                    Interviews — Last 7 Days
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={stats.dailyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="_id"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#22c55e"
                                            fill="#bbf7d0"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Mode breakdown */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="font-semibold text-gray-700 mb-4">
                                    Interview Modes
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={stats.modeBreakdown}
                                            dataKey="count"
                                            nameKey="_id"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={75}
                                            label={({ _id, percent }) =>
                                                `${_id} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {stats.modeBreakdown.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        COLORS[
                                                            i % COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── USERS ── */}
                {tab === "users" && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1 max-w-sm">
                                <BsSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setSearch(searchInput);
                                            setUserPage(1);
                                        }
                                    }}
                                    placeholder="Search by name or email…"
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setSearch(searchInput);
                                    setUserPage(1);
                                }}
                                className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                            >
                                Search
                            </button>
                            {search && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setSearchInput("");
                                        setUserPage(1);
                                    }}
                                    className="text-sm text-gray-500 hover:text-black cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                            <span className="text-sm text-gray-400 ml-auto">
                                {userTotal} users
                            </span>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {[
                                            "Name",
                                            "Email",
                                            "Role",
                                            "Interviews",
                                            "Joined",
                                            "Actions",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left px-5 py-3 text-gray-500 font-medium"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUI ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-10 text-gray-400"
                                            >
                                                Loading…
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <React.Fragment key={u._id}>
                                                <tr
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                                                    onClick={() =>
                                                        loadUserInterviews(
                                                            u._id,
                                                        )
                                                    }
                                                >
                                                    <td className="px-5 py-3 font-medium text-gray-800">
                                                        {u.name}
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500">
                                                        {u.email}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold
                            ${u.role === "admin" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                                                        >
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-500">
                                                        {u.interviewCount}{" "}
                                                        <span className="text-gray-300">
                                                            ({u.completedCount}{" "}
                                                            done)
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-gray-400">
                                                        {new Date(
                                                            u.createdAt,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td
                                                        className="px-5 py-3"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {/* Promote / Demote */}
                                                            {u._id !==
                                                                userData._id && (
                                                                <button
                                                                    disabled={
                                                                        roleLoading ===
                                                                        u._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleRoleChange(
                                                                            u._id,
                                                                            u.role ===
                                                                                "admin"
                                                                                ? "user"
                                                                                : "admin",
                                                                        )
                                                                    }
                                                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer
                                  ${
                                      u.role === "admin"
                                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                          : "bg-green-50 text-green-700 hover:bg-green-100"
                                  }
                                  disabled:opacity-50`}
                                                                >
                                                                    {roleLoading ===
                                                                    u._id
                                                                        ? "…"
                                                                        : u.role ===
                                                                            "admin"
                                                                          ? "Demote"
                                                                          : "Make Admin"}
                                                                </button>
                                                            )}
                                                            {/* Delete */}
                                                            {u._id !==
                                                                userData._id && (
                                                                <button
                                                                    onClick={() =>
                                                                        setConfirmDelete(
                                                                            u,
                                                                        )
                                                                    }
                                                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition cursor-pointer"
                                                                >
                                                                    <BsTrash />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded user interviews */}
                                                {expandedUser === u._id && (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="bg-gray-50 px-8 py-4"
                                                        >
                                                            {userInterviews.length ===
                                                            0 ? (
                                                                <p className="text-gray-400 text-sm">
                                                                    No
                                                                    interviews
                                                                    yet.
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                                                        Interview
                                                                        History
                                                                    </p>
                                                                    {userInterviews.map(
                                                                        (
                                                                            iv,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    iv._id
                                                                                }
                                                                                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                                                                            >
                                                                                <div>
                                                                                    <span className="font-medium text-gray-800">
                                                                                        {
                                                                                            iv.role
                                                                                        }
                                                                                    </span>
                                                                                    <span className="text-gray-400 ml-2">
                                                                                        {
                                                                                            iv.experience
                                                                                        }{" "}
                                                                                        ·{" "}
                                                                                        {
                                                                                            iv.mode
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-4">
                                                                                    <span className="font-bold text-green-600">
                                                                                        {
                                                                                            iv.finalScore
                                                                                        }
                                                                                        /10
                                                                                    </span>
                                                                                    <span
                                                                                        className={`text-xs px-2 py-0.5 rounded-full
                                        ${iv.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                                                                    >
                                                                                        {
                                                                                            iv.status
                                                                                        }
                                                                                    </span>
                                                                                    <span className="text-gray-400 text-xs">
                                                                                        {new Date(
                                                                                            iv.createdAt,
                                                                                        ).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <button
                                    disabled={userPage === 1}
                                    onClick={() => setUserPage((p) => p - 1)}
                                    className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30 hover:text-black cursor-pointer disabled:cursor-default"
                                >
                                    <BsChevronLeft /> Prev
                                </button>
                                <span className="text-sm text-gray-400">
                                    Page {userPage} of {userPages}
                                </span>
                                <button
                                    disabled={userPage === userPages}
                                    onClick={() => setUserPage((p) => p + 1)}
                                    className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30 hover:text-black cursor-pointer disabled:cursor-default"
                                >
                                    Next <BsChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── INTERVIEWS ── */}
                {tab === "interviews" && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <span className="text-sm text-gray-400">
                                {intTotal} total interviews
                            </span>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {[
                                            "User",
                                            "Role",
                                            "Mode",
                                            "Score",
                                            "Status",
                                            "Date",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left px-5 py-3 text-gray-500 font-medium"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingUI ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-10 text-gray-400"
                                            >
                                                Loading…
                                            </td>
                                        </tr>
                                    ) : (
                                        interviews.map((iv) => (
                                            <tr
                                                key={iv._id}
                                                className="border-b border-gray-50 hover:bg-gray-50 transition"
                                            >
                                                <td className="px-5 py-3">
                                                    <p className="font-medium text-gray-800">
                                                        {iv.userId?.name || "—"}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {iv.userId?.email}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3 text-gray-700">
                                                    {iv.role}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                        {iv.mode}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 font-bold text-green-600">
                                                    {iv.finalScore}/10
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className={`text-xs px-2.5 py-1 rounded-full font-medium
                          ${iv.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                                    >
                                                        {iv.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-gray-400">
                                                    {new Date(
                                                        iv.createdAt,
                                                    ).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <button
                                    disabled={intPage === 1}
                                    onClick={() => setIntPage((p) => p - 1)}
                                    className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30 hover:text-black cursor-pointer disabled:cursor-default"
                                >
                                    <BsChevronLeft /> Prev
                                </button>
                                <span className="text-sm text-gray-400">
                                    Page {intPage} of {intPages}
                                </span>
                                <button
                                    disabled={intPage === intPages}
                                    onClick={() => setIntPage((p) => p + 1)}
                                    className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-30 hover:text-black cursor-pointer disabled:cursor-default"
                                >
                                    Next <BsChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                    >
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                            Delete User?
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            This will permanently delete{" "}
                            <span className="font-medium text-gray-800">
                                {confirmDelete.name}
                            </span>{" "}
                            and all their interviews.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete._id)}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition font-medium cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
