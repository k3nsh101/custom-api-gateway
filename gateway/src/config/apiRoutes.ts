const API_ROUTES = [
  {
    path: "/serviceA",
    upstream: process.env["SERVICE_A_URL"] || "http://localhost:3001",
    protected: true,
  },
  {
    path: "/serviceB",
    upstream: process.env["SERVICE_B_URL"] || "http://localhost:3001",
    protected: false,
  },
];

export default API_ROUTES;
