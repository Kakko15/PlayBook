import supabase from "../supabaseClient.js";

export const getRecentActivity = async (req, res, next) => {
  const { limit = 10 } = req.query;
  try {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
