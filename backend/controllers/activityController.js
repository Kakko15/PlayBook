import supabase from "../supabaseClient.js";

export const getRecentActivity = async (req, res) => {
  const { limit = 10 } = req.query;
  try {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Recent Activity Error:", error.message);
    res.status(500).json({ message: "Error fetching recent activity." });
  }
};
