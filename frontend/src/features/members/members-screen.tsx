"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/shared/section-card";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFamilyMember, deleteFamilyMember, updateFamilyMember } from "@/lib/api/healthguard";
import { useFamily } from "@/lib/family";
import { AVATAR_COLORS, RELATION_LABELS, type FamilyMember } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

const RELATIONS = Object.keys(RELATION_LABELS);
const AGE_RANGES = ["pediatric", "adult", "senior"];
const AGE_LABELS: Record<string, string> = { pediatric: "Pediatric", adult: "Adult", senior: "Senior" };
const COLOR_KEYS = Object.keys(AVATAR_COLORS);

interface MemberFormState {
  name: string;
  relation: string;
  age_range: string;
  sex: string;
  avatar_color: string;
  notes: string;
}

const emptyForm: MemberFormState = {
  name: "",
  relation: "self",
  age_range: "adult",
  sex: "",
  avatar_color: "blue",
  notes: "",
};

function ColorSwatchPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "h-7 w-7 rounded-full border-2 transition",
            value === key ? "border-foreground scale-110" : "border-transparent",
          )}
          style={{ backgroundColor: AVATAR_COLORS[key] }}
          aria-label={key}
        />
      ))}
    </div>
  );
}

function MemberForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: FamilyMember;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<MemberFormState>(
    initial
      ? {
          name: initial.name,
          relation: initial.relation,
          age_range: initial.age_range,
          sex: initial.sex ?? "",
          avatar_color: initial.avatar_color,
          notes: initial.notes ?? "",
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (initial) {
        await updateFamilyMember(initial.id, {
          name: form.name,
          relation: form.relation,
          age_range: form.age_range,
          sex: form.sex || undefined,
          avatar_color: form.avatar_color,
          notes: form.notes || undefined,
        });
        toast.success("Profile updated");
      } else {
        await createFamilyMember({
          name: form.name,
          relation: form.relation,
          age_range: form.age_range,
          sex: form.sex || null,
          avatar_color: form.avatar_color,
          notes: form.notes || null,
        });
        toast.success("Family member added");
      }
      await onSaved();
      onCancel();
    } catch {
      toast.error("Could not save profile. Is the backend running?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-4">
      <div>
        <Label htmlFor="member_name">Name</Label>
        <Input id="member_name" placeholder="e.g. Priya" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="member_relation">Relation</Label>
          <select
            id="member_relation"
            className="mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
          >
            {RELATIONS.map((r) => (
              <option key={r} value={r}>{RELATION_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="member_age">Age range</Label>
          <select
            id="member_age"
            className="mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            value={form.age_range}
            onChange={(e) => setForm({ ...form, age_range: e.target.value })}
          >
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>{AGE_LABELS[a]}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="member_sex">Sex (optional)</Label>
        <Input id="member_sex" placeholder="e.g. female, male, other" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} />
      </div>
      <div>
        <Label>Avatar color</Label>
        <ColorSwatchPicker value={form.avatar_color} onChange={(c) => setForm({ ...form, avatar_color: c })} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add member"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function MemberCard({ member, onChanged }: { member: FamilyMember; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove ${member.name} from your family profiles?`)) return;
    setDeleting(true);
    try {
      await deleteFamilyMember(member.id);
      toast.success("Profile removed");
      await onChanged();
    } catch {
      toast.error("Could not remove profile");
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return <MemberForm initial={member} onCancel={() => setEditing(false)} onSaved={onChanged} />;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} color={member.avatar_color} size="lg" />
          <div>
            <p className="font-semibold text-foreground">{member.name}</p>
            <p className="text-xs text-muted-foreground">
              {RELATION_LABELS[member.relation] ?? member.relation} · {AGE_LABELS[member.age_range] ?? member.age_range}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {member.notes && (
        <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">{member.notes}</p>
      )}
    </div>
  );
}

export function MembersScreen() {
  const { members, refreshMembers } = useFamily();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Family Profiles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the family members whose symptoms and medications you're tracking.
        </p>
      </div>

      <SectionCard title="Profiles" description={`${members.length} member${members.length === 1 ? "" : "s"}`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} onChanged={refreshMembers} />
          ))}

          {adding ? (
            <MemberForm onCancel={() => setAdding(false)} onSaved={refreshMembers} />
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add member</span>
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
