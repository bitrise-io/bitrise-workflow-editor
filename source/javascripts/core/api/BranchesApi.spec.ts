import BranchesApi from './BranchesApi';
import { ClientError } from './client';

function clientError(status: number, data?: Record<string, unknown>) {
  return new ClientError(new Error('boom'), new Response(null, { status }), data);
}

describe('BranchesApi.parsePushConflict', () => {
  it('parses a modular 409 body into a per-file conflict, mapping snake_case to camelCase', () => {
    const error = clientError(409, {
      status: 'conflict',
      commit_sha: 'head999',
      remote_yml: 'workflows: {}\n',
      conflicts: [
        { node_id: 'n_root', path: 'bitrise.yml', remote_yml: "format_version: '14'\n" },
        { node_id: 'n_wf', path: 'workflows/deploy.yml', remote_yml: 'workflows: {}\n' },
      ],
    });

    expect(BranchesApi.parsePushConflict(error)).toEqual({
      commitSha: 'head999',
      conflicts: [
        { nodeId: 'n_root', path: 'bitrise.yml', remoteYml: "format_version: '14'\n" },
        { nodeId: 'n_wf', path: 'workflows/deploy.yml', remoteYml: 'workflows: {}\n' },
      ],
    });
  });

  it('returns undefined for a single-file (legacy) 409 that has no `conflicts` array', () => {
    const error = clientError(409, { status: 'conflict', commit_sha: 'head999', remote_yml: 'workflows: {}\n' });
    expect(BranchesApi.parsePushConflict(error)).toBeUndefined();
  });

  it('returns undefined for an empty conflicts list', () => {
    const error = clientError(409, { status: 'conflict', commit_sha: 'head999', conflicts: [] });
    expect(BranchesApi.parsePushConflict(error)).toBeUndefined();
  });

  it('returns undefined for a non-409 error', () => {
    expect(BranchesApi.parsePushConflict(clientError(403, { conflicts: [{ node_id: 'x' }] }))).toBeUndefined();
  });

  it('returns undefined for a non-ClientError value', () => {
    expect(BranchesApi.parsePushConflict(new Error('plain'))).toBeUndefined();
    expect(BranchesApi.parsePushConflict(undefined)).toBeUndefined();
  });

  it('defaults missing per-file fields to empty strings', () => {
    const error = clientError(409, { conflicts: [{ path: 'a.yml' }] });
    expect(BranchesApi.parsePushConflict(error)).toEqual({
      commitSha: '',
      conflicts: [{ nodeId: '', path: 'a.yml', remoteYml: '' }],
    });
  });
});
