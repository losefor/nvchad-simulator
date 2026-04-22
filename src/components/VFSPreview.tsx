import { useMemo } from "react";
import type { VFS, VFSDir } from "../vfs";
import { getNode, resolvePath } from "../vfs";

interface Props {
  vfs: VFS;
  onClose: () => void;
}

function findIndexHtml(vfs: VFS): { html: string; dir: string[] } | null {
  // Check cwd first
  const inCwd = [...vfs.cwd, "index.html"];
  const cwdNode = getNode(vfs.root, inCwd);
  if (cwdNode?.type === "file") return { html: cwdNode.content.join("\n"), dir: vfs.cwd };

  // Walk whole tree
  function search(node: VFSDir, path: string[]): { html: string; dir: string[] } | null {
    for (const [name, child] of Object.entries(node.children)) {
      if (name === "index.html" && child.type === "file") {
        return { html: child.content.join("\n"), dir: path };
      }
      if (child.type === "dir") {
        const found = search(child, [...path, name]);
        if (found) return found;
      }
    }
    return null;
  }
  return search(vfs.root, []);
}

function inlineAssets(html: string, dir: string[], vfs: VFS): string {
  // Inline <link rel="stylesheet" href="..."> — handles both attribute orders
  const linkRe = /<link\b([^>]*)>/gi;
  html = html.replace(linkRe, (tag, attrs) => {
    if (!/rel=["']stylesheet["']/i.test(attrs)) return tag;
    const hrefMatch = /href=["']([^"']+)["']/i.exec(attrs);
    if (!hrefMatch) return tag;
    const p = resolvePath(dir, hrefMatch[1]);
    const node = getNode(vfs.root, p);
    return node?.type === "file" ? `<style>\n${node.content.join("\n")}\n</style>` : "";
  });

  // Inline <script src="..."></script>
  html = html.replace(/<script\b([^>]*)><\/script>/gi, (_, attrs) => {
    const srcMatch = /src=["']([^"']+)["']/i.exec(attrs);
    if (!srcMatch) return _;
    const p = resolvePath(dir, srcMatch[1]);
    const node = getNode(vfs.root, p);
    return node?.type === "file" ? `<script>\n${node.content.join("\n")}\n</script>` : "";
  });

  return html;
}

export default function VFSPreview({ vfs, onClose }: Props) {
  const srcdoc = useMemo(() => {
    const found = findIndexHtml(vfs);
    if (!found) {
      return `<html><body style="font-family:sans-serif;padding:24px;color:#333">
        <p>No <code>index.html</code> found in the VFS.</p>
        <p style="margin-top:8px;color:#888;font-size:13px">Create one with <code>touch index.html</code> in the terminal.</p>
      </body></html>`;
    }
    return inlineAssets(found.html, found.dir, vfs);
  }, [vfs]);

  return (
    <div className="vfs-preview">
      <div className="vfs-preview-bar">
        <span className="vfs-preview-label"> Preview</span>
        <span className="vfs-preview-hint">auto-updates on save (:w)</span>
        <button className="vfs-preview-close" onClick={onClose} title="Close preview">✕</button>
      </div>
      <iframe
        className="vfs-preview-frame"
        srcdoc={srcdoc}
        sandbox="allow-scripts"
        title="VFS Preview"
      />
    </div>
  );
}
