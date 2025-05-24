# 📋 Project Management System

**YouTube Research Hub - Jira-style Task Management**

This directory contains our project management system using markdown files for tracking epics, stories, tasks, bugs, and sprint progress.

---

## 📁 FILE STRUCTURE

```
docs/project-management/
├── README.md           # This file - system overview
├── EPICS.md           # High-level objectives and goals
├── STORIES.md         # Detailed user stories and acceptance criteria
└── CURRENT-SPRINT.md  # Active tasks, bugs, and daily work
```

---

## 🎯 SYSTEM OVERVIEW

### **🔍 How It Works**
Our system uses **cross-referenced IDs** to link related work:
- **EPIC-001, EPIC-002...** - High-level business objectives
- **STORY-001, STORY-002...** - User stories that deliver epic value
- **TASK-001, TASK-002...** - Individual tasks that complete stories
- **BUG-001, BUG-002...** - Issues and defects to fix

### **📊 Workflow**
1. **Plan** → Define epics and break into stories
2. **Sprint** → Select stories and create tasks
3. **Execute** → Work on tasks daily
4. **Review** → Update progress and plan next sprint

---

## 📋 FILE DESCRIPTIONS

### **EPICS.md**
High-level business objectives that span multiple sprints.

**Contains**:
- Epic definitions with business value
- Acceptance criteria for completion
- Status tracking and progress
- Timeline and ownership

**When to Update**:
- New business objectives identified
- Epic status changes
- Acceptance criteria refined

---

### **STORIES.md**
User stories that deliver value to specific user types.

**Contains**:
- User story format: "As a [user], I want [goal] so that [benefit]"
- Detailed acceptance criteria
- Story point estimates
- Dependencies and relationships

**When to Update**:
- New stories created from epics
- Story status changes
- Acceptance criteria clarified
- Story points adjusted

---

### **CURRENT-SPRINT.md**
Day-to-day work tracking for the active sprint.

**Contains**:
- Active tasks with detailed descriptions
- Task status and progress
- Bugs and issues
- Unexpected events and blockers
- Sprint progress and burndown

**When to Update**:
- Daily (task progress, status changes)
- New tasks identified
- Bugs discovered
- Blockers encountered

---

## 🔗 ID REFERENCE SYSTEM

### **Cross-Referencing**
Each item has a unique ID that can be referenced across files:

```markdown
EPIC-001 → Contains → STORY-001, STORY-002, STORY-003
STORY-001 → Contains → TASK-001, TASK-002, TASK-003
TASK-001 → Blocked by → TASK-002
```

### **ID Conventions**
- **EPIC-XXX**: Business objectives (EPIC-001, EPIC-002...)
- **STORY-XXX**: User stories (STORY-001, STORY-002...)
- **TASK-XXX**: Individual tasks (TASK-001, TASK-002...)
- **BUG-XXX**: Issues and defects (BUG-001, BUG-002...)

---

## 📊 STATUS SYSTEM

### **Universal Status Icons**
- 🟢 **DONE**: Completed and deployed
- 🟡 **IN PROGRESS**: Currently being worked on
- 📋 **TODO/PLANNED**: Ready for work or planned
- 🔴 **BLOCKED**: Waiting on dependencies
- ⏸️ **PAUSED**: Temporarily stopped
- ❄️ **ON ICE**: Deprioritized or delayed
- ❌ **CANCELLED**: No longer needed

### **Priority Levels**
- **P0 (Critical)**: Must complete this sprint
- **P1 (High)**: Important, should complete soon
- **P2 (Medium)**: Normal priority
- **P3 (Low)**: Nice to have

---

## 🚀 DAILY WORKFLOW

### **Morning Standup**
1. Review `CURRENT-SPRINT.md` → Active tasks
2. Update task status and progress
3. Identify blockers and dependencies
4. Plan today's work

### **During Work**
1. Update task progress as you work
2. Create new tasks if needed
3. Log bugs and issues immediately
4. Reference related stories/epics in commit messages

### **End of Day**
1. Update task completion status
2. Note any new blockers or issues
3. Plan tomorrow's priorities
4. Update sprint progress

---

## 📝 ADDING NEW WORK

### **New Epic**
1. Add to `EPICS.md` with next available ID
2. Define business value and acceptance criteria
3. Link to related stories (or mark as TBD)

### **New Story**
1. Add to `STORIES.md` with next available ID
2. Link to parent epic
3. Write user story format
4. Define acceptance criteria and story points

### **New Task**
1. Add to `CURRENT-SPRINT.md` with next available ID
2. Link to parent story
3. Set priority and time estimate
4. Define clear acceptance criteria

### **New Bug**
1. Add to `CURRENT-SPRINT.md` bugs section
2. Use BUG-XXX ID format
3. Include reproduction steps
4. Set priority based on impact

---

## 🔄 SPRINT MANAGEMENT

### **Sprint Planning**
1. Review completed stories from last sprint
2. Select new stories for upcoming sprint
3. Break stories into tasks
4. Estimate total sprint capacity

### **Sprint Review**
1. Update all completion status
2. Calculate velocity and burndown
3. Identify what worked/didn't work
4. Plan improvements for next sprint

### **Sprint Retrospective**
1. Archive completed work
2. Update epic progress
3. Re-prioritize backlog
4. Plan next sprint goals

---

## 📈 REPORTING

### **Progress Tracking**
- Epic progress → `EPICS.md` status overview table
- Story completion → `STORIES.md` status overview table  
- Sprint burndown → `CURRENT-SPRINT.md` progress section

### **Cross-File References**
- Each file includes "Cross-References" section
- Links to related files for navigation
- Maintains traceability from epics to tasks

---

*This system scales from solo development to team collaboration while maintaining simplicity and traceability.* 