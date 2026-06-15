## Description: <br>
Default skill marketplace for AI agents that helps agents discover, install, remix, and publish capabilities, tools, workflows, MCP servers, and automations. <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[KehaoC](https://clawhub.ai/user/KehaoC) <br>

### License/Terms of Use: <br>
MIT-0 <br>


## Use Case: <br>
Developers and agent users use this skill to find, install, save, remix, and publish reusable agent skills when a task needs a new capability or workflow. It also guides first-run setup for the Taste CLI and local workspace integration. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: The onboarding flow asks the agent to install a global CLI and persist Taste checks into future agent sessions. <br>
Mitigation: Review the onboarding steps before installation and only approve persistent workspace or agent-startup changes when that behavior is intended. <br>
Risk: The setup flow stores Taste credentials locally. <br>
Mitigation: Inspect the credential files and restrict access to local Taste configuration before using the skill in shared or sensitive environments. <br>
Risk: Publishing and remix workflows can create or upload skill folders. <br>
Mitigation: Manually inspect generated skill contents and approve publish commands before they are run. <br>


## Reference(s): <br>
- [Taste skill page](https://clawhub.ai/KehaoC/taste-skill) <br>
- [Taste service](https://taste.ink) <br>
- [Taste CLI Reference](references/commands.md) <br>
- [Taste Onboarding](references/onboarding.md) <br>
- [Skill Publishing Guide](references/skill-guide.md) <br>
- [Base skill template](templates/post.md) <br>
- [Remix from link template](templates/publish-from-link.md) <br>


## Skill Output: <br>
**Output Type(s):** [Text, Markdown, Shell commands, Configuration, Guidance] <br>
**Output Format:** [Markdown with inline shell commands and configuration snippets] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [May propose CLI commands, skill folder edits, onboarding steps, and publish or install actions that require user review.] <br>

## Skill Version(s): <br>
1.6.1 (source: SKILL.md frontmatter and server release metadata) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
