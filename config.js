module.exports = {
  paths: {
    projectsRoot: "~/claw-workspace/projects"
  },
  preview: {
    max: 3,
    ttlMinutes: 15
  },
  publish: {
    enabled: true,
    endpoint: "http://127.0.0.1:3000/upload",
    timeoutMs: 30000,
    fileField: "file",
    metadataField: "",
    asyncFallback: false,
    asyncFlagField: "preferAsync",
    statusUrlField: "pollUrl"
  }
};
