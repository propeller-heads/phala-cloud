/**
 * Conventional Changelog configuration
 * Used by conventional-changelog-cli to generate CHANGELOG.md
 *
 * Strategy: Relaxed validation with intelligent categorization
 * - Accept any commit type (commitlint allows all types)
 * - Map custom types (imp, deps) to display in appropriate sections
 * - Display important changes (feat, fix, imp->refactor, deps->chore, refactor, docs)
 * - Hide internal changes (test, ci, build, style)
 */

const typeMapping = {
  // Standard types
  'feat': { section: 'Features', hidden: false },
  'feature': { section: 'Features', hidden: false },
  'fix': { section: 'Bug Fixes', hidden: false },
  'ifx': { section: 'Bug Fixes', hidden: false },

  // Custom types mapped to Improvements (shown as refactor internally)
  'imp': { section: 'Improvements', hidden: false, mapTo: 'refactor' },
  'improve': { section: 'Improvements', hidden: false, mapTo: 'refactor' },
  'improvement': { section: 'Improvements', hidden: false, mapTo: 'refactor' },

  // Dependency types mapped to Dependencies (shown as docs internally to get visible)
  'deps': { section: 'Dependencies', hidden: false, mapTo: 'docs' },
  'dep': { section: 'Dependencies', hidden: false, mapTo: 'docs' },
  'dependencies': { section: 'Dependencies', hidden: false, mapTo: 'docs' },
  'dependency': { section: 'Dependencies', hidden: false, mapTo: 'docs' },

  // Standard visible types
  'refactor': { section: 'Code Refactoring', hidden: false },
  'perf': { section: 'Performance Improvements', hidden: false },
  'performance': { section: 'Performance Improvements', hidden: false },
  'docs': { section: 'Documentation', hidden: false },
  'doc': { section: 'Documentation', hidden: false },
  'revert': { section: 'Reverts', hidden: false },

  // Hidden types
  'chore': { section: 'Miscellaneous Chores', hidden: true },
  'test': { section: 'Tests', hidden: true },
  'tests': { section: 'Tests', hidden: true },
  'ci': { section: 'Continuous Integration', hidden: true },
  'build': { section: 'Build System', hidden: true },
  'style': { section: 'Styles', hidden: true },
};

module.exports = {
  // Define types with friendly section names
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', section: 'Documentation' },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'test', hidden: true },
    { type: 'build', hidden: true },
    { type: 'ci', hidden: true },
    { type: 'chore', hidden: true },
    { type: 'style', hidden: true },
  ],

  writerOpts: {
    transform: (commit, context) => {
      const mapping = typeMapping[commit.type];

      // Hide commits based on mapping
      if (mapping && mapping.hidden) {
        return;
      }

      // Create a new commit object (avoid mutating immutable object)
      const newCommit = { ...commit };

      if (mapping) {
        // Map custom types to standard types
        if (mapping.mapTo) {
          newCommit.type = mapping.mapTo;
        }
      } else {
        // Unknown types go to refactor (will be shown)
        newCommit.type = 'refactor';
      }

      // Standard transformations
      if (newCommit.scope === '*') {
        newCommit.scope = '';
      }

      if (typeof newCommit.hash === 'string') {
        newCommit.shortHash = newCommit.hash.substring(0, 7);
      }

      if (typeof newCommit.subject === 'string') {
        newCommit.subject = newCommit.subject.substring(0, 80);
      }

      return newCommit;
    },
    groupBy: 'type',
    commitGroupsSort: 'title',
    commitsSort: ['scope', 'subject'],
  },
};
