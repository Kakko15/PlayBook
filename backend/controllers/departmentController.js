import supabase from "../supabaseClient.js";
import { sanitize } from "../utils/sanitize.js";

export const getDepartments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    if (error) return next(error);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  const { name, acronym, elo_rating } = req.body;

  if (!name || !acronym) {
    return res.status(400).json({ message: "Name and acronym are required." });
  }

  try {
    const { data, error } = await supabase
      .from("departments")
      .insert({
        name: sanitize(name),
        acronym: sanitize(acronym),
        elo_rating: elo_rating || 1200,
      })
      .select()
      .single();

    if (error) return next(error);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  const { id } = req.params;
  const { name, acronym, elo_rating } = req.body;

  const updates = {
    name: sanitize(name),
    acronym: sanitize(acronym),
    elo_rating,
  };

  Object.keys(updates).forEach(
    (key) => updates[key] === undefined && delete updates[key]
  );

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }

  try {
    const { data, error } = await supabase
      .from("departments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return next(error);
    if (!data) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        return res.status(409).json({
          message:
            "Cannot delete department. It is still linked to one or more teams.",
        });
      }
      return next(error);
    }

    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    next(error);
  }
};
