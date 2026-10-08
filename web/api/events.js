/** Accept lightweight analytics beacons · no storage (204). */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  return res.status(204).end();
}
