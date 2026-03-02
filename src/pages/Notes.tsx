
import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useAsyncStorage";
import type { Note } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, StickyNote, Bell, Check, Trash2, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const Notes = () => {
    const { data: unsortedNotes, loading: isLoading, add, update, delete: deleteNote } = useNotes();
    const [notes, setNotes] = useState<Note[]>([]);
    const { toast } = useToast();

    // New Note State
    const [isParamsOpen, setIsParamsOpen] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isReminder, setIsReminder] = useState(false);
    const [reminderDate, setReminderDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        // Sort by created date desc
        const sorted = [...unsortedNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotes(sorted);
    }, [unsortedNotes]);

    const handleAddNote = async () => {
        if (!newNoteTitle.trim()) {
            toast({
                title: "Title Required",
                description: "Please enter a title for the note.",
                variant: "destructive",
            });
            return;
        }

        try {
            const newNote: Note = {
                id: crypto.randomUUID(),
                title: newNoteTitle,
                content: newNoteContent,
                isReminder,
                reminderDate: isReminder && reminderDate ? reminderDate.toISOString() : undefined,
                completed: false,
                createdAt: new Date().toISOString(),
            };

            await add(newNote);

            // Reset form
            setNewNoteTitle("");
            setNewNoteContent("");
            setIsReminder(false);
            setReminderDate(new Date());
            setIsParamsOpen(false);

            toast({
                title: "Success",
                description: "Note added successfully.",
            });
        } catch (error) {
            console.error("Failed to add note:", error);
            toast({
                title: "Error",
                description: "Failed to add note.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNote(id);
            toast({
                title: "Deleted",
                description: "Note deleted successfully.",
            });
        } catch (error) {
            console.error("Failed to delete note:", error);
            toast({
                title: "Error",
                description: "Failed to delete note.",
                variant: "destructive",
            });
        }
    };

    const handleToggleComplete = async (note: Note) => {
        try {
            const updatedNote = { ...note, completed: !note.completed };
            await update(note.id, updatedNote);
        } catch (error) {
            console.error("Failed to update note:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notes & Reminders</h1>
                    <p className="text-muted-foreground">Manage your tasks, notes, and reminders.</p>
                </div>
                <Dialog open={isParamsOpen} onOpenChange={setIsParamsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Note
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Note</DialogTitle>
                            <DialogDescription>
                                Add a simple note or set a reminder for important tasks.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Note title..."
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Details..."
                                    className="min-h-[100px]"
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 border p-3 rounded-lg bg-muted/20">
                                <Switch
                                    id="reminder-mode"
                                    checked={isReminder}
                                    onCheckedChange={setIsReminder}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="reminder-mode" className="cursor-pointer font-medium">Set as Reminder</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {isReminder ? "This note will act as a reminder with a date." : "Simple note without a deadline."}
                                    </p>
                                </div>
                                {isReminder && <Bell className="h-5 w-5 text-yellow-500 animate-pulse" />}
                            </div>

                            {isReminder && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label>Reminder Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !reminderDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={reminderDate}
                                                onSelect={setReminderDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsParamsOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddNote}>Save Note</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <StickyNote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-medium">No notes yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first note or reminder to get started.</p>
                    <Button onClick={() => setIsParamsOpen(true)}>Create Note</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Card key={note.id} className={cn(
                            "group transition-all duration-300 hover:shadow-md relative overflow-hidden border-l-4",
                            note.completed ? "opacity-60 bg-muted/30 border-l-muted-foreground/30" :
                                note.isReminder ? "border-l-yellow-500 dark:border-l-yellow-600" : "border-l-blue-500 dark:border-l-blue-600"
                        )}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className={cn("text-lg", note.completed && "line-through text-muted-foreground")}>
                                            {note.title}
                                        </CardTitle>
                                        {note.isReminder && note.reminderDate && (
                                            <CardDescription className="flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-500">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(note.reminderDate), "PPP")}
                                            </CardDescription>
                                        )}
                                        {!note.isReminder && (
                                            <CardDescription className="text-xs">
                                                Created {format(new Date(note.createdAt), "P")}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4"
                                        onClick={(e) => handleDeleteNote(note.id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className={cn("text-sm whitespace-pre-wrap", note.completed && "text-muted-foreground")}>
                                    {note.content || <span className="italic text-muted-foreground">No content</span>}
                                </p>
                            </CardContent>
                            <div className="absolute top-4 right-4" />
                            <CardFooter className="pt-0 flex justify-end">
                                <Button
                                    variant={note.completed ? "outline" : "secondary"}
                                    size="sm"
                                    className={cn("gap-1 text-xs", note.completed && "text-green-600 border-green-200 bg-green-50")}
                                    onClick={() => handleToggleComplete(note)}
                                >
                                    <Check className="h-3 w-3" />
                                    {note.completed ? "Completed" : "Mark Done"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notes;
