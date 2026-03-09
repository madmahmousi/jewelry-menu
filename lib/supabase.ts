import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ogdsikrrfafjxfkrpgon.supabase.co";
const supabaseKey =
  "sb_publishable_an0ushHpDkPFKurTeor2i1Q_Ir5dkbr5";

export const supabase = createClient(supabaseUrl, supabaseKey);
