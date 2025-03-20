package git

import (
	"github.com/bitrise-io/go-utils/command"
)

// Init creates an empty Git reporitory or reinitializes an existing one.
func (g *Git) Init() *command.Model {
	return g.command("init")
}

// Clone a repository into a new directory.
func (g *Git) Clone(repo string, opts ...string) *command.Model {
	args := []string{"clone"}
	args = append(args, opts...)
	args = append(args, repo)
	args = append(args, ".")
	return g.command(args...)
}

// CloneTagOrBranch is recursively clones a tag or branch.
func (g *Git) CloneTagOrBranch(repo, tagOrBranch string, opts ...string) *command.Model {
	args := []string{"clone"}
	args = append(args, "--recursive")
	args = append(args, []string{"--branch", tagOrBranch}...)
	args = append(args, opts...)
	args = append(args, repo)
	args = append(args, ".")

	return g.command(args...)
}

// RemoteList shows a list of existing remote urls with remote names.
func (g *Git) RemoteList() *command.Model {
	return g.command("remote", "-v")
}

// RemoteAdd adds a remote named <name> for the repository at <url>.
func (g *Git) RemoteAdd(name, url string) *command.Model {
	return g.command("remote", "add", name, url)
}

// Fetch downloads objects and refs from another repository.
func (g *Git) Fetch(opts ...string) *command.Model {
	args := []string{"fetch"}
	args = append(args, opts...)
	return g.command(args...)
}

// Checkout switches branches or restore working tree files.
// Arg can be a commit hash, a branch or a tag.
func (g *Git) Checkout(arg string) *command.Model {
	return g.command("checkout", arg)
}

// Merge joins two or more development histories together.
// Arg can be a commit hash, branch or tag.
func (g *Git) Merge(arg string) *command.Model {
	return g.command("merge", arg)
}

// Reset the current branch head to commit and possibly updates the index.
// The mode must be one of the following: --soft, --mixed, --hard, --merge, --keep.
func (g *Git) Reset(mode, commit string) *command.Model {
	return g.command("reset", mode, commit)
}

// Clean removes untracked files from the working tree.
func (g *Git) Clean(options ...string) *command.Model {
	args := []string{"clean"}
	args = append(args, options...)
	return g.command(args...)
}

// SubmoduleUpdate updates the registered submodules.
func (g *Git) SubmoduleUpdate(opts ...string) *command.Model {
	args := []string{"submodule", "update", "--init", "--recursive"}
	args = append(args, opts...)
	return g.command(args...)
}

// SubmoduleForeach evaluates an arbitrary git command in each checked out
// submodule.
func (g *Git) SubmoduleForeach(command *command.Model) *command.Model {
	args := []string{"submodule", "foreach"}
	args = append(args, command.GetCmd().Args...)
	return g.command(args...)
}

// Pull incorporates changes from a remote repository into the current branch.
func (g *Git) Pull() *command.Model {
	return g.command("pull")
}

// Add file contents to the index. Pathspec is the list of files to add content from.
// Fileglobs (e.g. *.c) can be given to add all matching files.
func (g *Git) Add(pathspec string) *command.Model {
	return g.command("add", pathspec)
}

// Branch lists branches.
func (g *Git) Branch(opts ...string) *command.Model {
	args := append([]string{"branch"}, opts...)
	return g.command(args...)
}

// NewBranch creates a new branch as if git-branch were called and then check it out.
func (g *Git) NewBranch(branch string) *command.Model {
	return g.command("checkout", "-b", branch)
}

// Apply reads the supplied diff output (patch) and applies it to files.
func (g *Git) Apply(patch string) *command.Model {
	return g.command("apply", "--index", patch)
}

// Log shows the commit logs. The format parameter controls what is shown and how.
// Revision range can be optionally specified using the opts parameter.
func (g *Git) Log(format string, opts ...string) *command.Model {
	args := []string{"log", "-1", "--format=" + format}
	args = append(args, opts...)
	return g.command(args...)
}

// RevList lists commit objects in reverse chronological order.
func (g *Git) RevList(commit string, opts ...string) *command.Model {
	args := []string{"rev-list", commit}
	args = append(args, opts...)
	return g.command(args...)
}

// Push updates remote refs along with associated objects.
func (g *Git) Push(branch string) *command.Model {
	return g.command("push", "-u", "origin", branch)
}

// Commit Stores the current contents of the index in a new commit along with a log message from the user describing the changes.
func (g *Git) Commit(message string) *command.Model {
	return g.command("commit", "-m", message)
}

// RevParse picks out and massage parameters.
func (g *Git) RevParse(arg string) *command.Model {
	return g.command("rev-parse", arg)
}

// Status shows the working tree status.
func (g *Git) Status(opts ...string) *command.Model {
	args := []string{"status"}
	args = append(args, opts...)
	return g.command(args...)
}

// Config sets a git config setting for the repository.
func (g *Git) Config(key string, value string, opts ...string) *command.Model {
	args := []string{"config", key, value}
	args = append(args, opts...)
	return g.command(args...)
}

// SparseCheckoutInit initializes the sparse-checkout config file.
func (g *Git) SparseCheckoutInit(cone bool) *command.Model {
	args := []string{"sparse-checkout", "init"}
	if cone {
		args = append(args, "--cone")
	}
	return g.command(args...)
}

// SparseCheckoutSet writes the provided patterns to the sparse-checkout config file.
func (g *Git) SparseCheckoutSet(opts ...string) *command.Model {
	args := []string{"sparse-checkout", "set"}
	args = append(args, opts...)
	return g.command(args...)
}

// UpdateRef updates the object name stored in a ref safely.
// With -d flag, it deletes the named <ref>.
func (g *Git) UpdateRef(opts ...string) *command.Model {
	args := []string{"update-ref"}
	args = append(args, opts...)
	return g.command(args...)
}
