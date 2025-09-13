const API_ROUTES = [
  {
    path: "/serviceA",
    upstream: "http://localhost:3001",
  },
  {
    path: "/serviceB",
    upstream: "http://localhost:3002",
  },
];

export default API_ROUTES;
