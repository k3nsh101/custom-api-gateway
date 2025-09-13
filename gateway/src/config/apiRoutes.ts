const API_ROUTES = [
  {
    path: "/serviceA",
    upstream: "http://localhost:3001",
    protected: true,
  },
  {
    path: "/serviceB",
    upstream: "http://localhost:3002",
    protected: false,
  },
];

export default API_ROUTES;
