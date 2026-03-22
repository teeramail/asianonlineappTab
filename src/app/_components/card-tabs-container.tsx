"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import { CardDiscussion } from "./card-discussion";

interface CardTabsContainerProps {
  card: {
    id: number;
    groupCalendar: string | null;
    expenses: string | null;
  };
}

type CalendarEvent = { id: string; date: string; time: string; note: string };
type ExpenseItem = { id: string; item: string; amount: number; date: string; note: string };

export function CardTabsContainer({ card }: CardTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<"discussion" | "calendar" | "expense">("discussion");
  const [savingTab, setSavingTab] = useState<"calendar" | "expense" | null>(null);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    try {
      return card.groupCalendar ? (JSON.parse(card.groupCalendar) as CalendarEvent[]) : [];
    } catch {
      return [];
    }
  });
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventNote, setNewEventNote] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Expense state
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(() => {
    try {
      return card.expenses ? (JSON.parse(card.expenses) as ExpenseItem[]) : [];
    } catch {
      return [];
    }
  });
  const [newExpenseItem, setNewExpenseItem] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | "">("");
  const [newExpenseDate, setNewExpenseDate] = useState("");
  const [newExpenseNote, setNewExpenseNote] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const utils = api.useUtils();
  const updateCard = api.studyCards.update.useMutation({
    onSuccess: () => {
      void utils.studyCards.getAll.invalidate();
    },
  });

  const saveCalendarEvents = async (events: CalendarEvent[]) => {
    setSavingTab("calendar");
    try {
      await updateCard.mutateAsync({
        id: card.id,
        groupCalendar: JSON.stringify(events),
      });
    } finally {
      setSavingTab(null);
    }
  };

  const addCalendarEvent = () => {
    if (!newEventDate || !newEventNote.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: newEventDate,
      time: newEventTime || "",
      note: newEventNote.trim(),
    };
    const updatedEvents = [...calendarEvents, newEvent].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    setCalendarEvents(updatedEvents);
    void saveCalendarEvents(updatedEvents);
    setNewEventDate("");
    setNewEventTime("");
    setNewEventNote("");
  };

  const deleteCalendarEvent = (id: string) => {
    const updatedEvents = calendarEvents.filter((e) => e.id !== id);
    setCalendarEvents(updatedEvents);
    void saveCalendarEvents(updatedEvents);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = calendarEvents
      .map((e) => (e.id === id ? { ...e, ...updates } : e))
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    setCalendarEvents(updatedEvents);
    void saveCalendarEvents(updatedEvents);
    setEditingEventId(null);
  };

  const saveExpenseItems = async (items: ExpenseItem[]) => {
    setSavingTab("expense");
    try {
      await updateCard.mutateAsync({
        id: card.id,
        expenses: JSON.stringify(items),
      });
    } finally {
      setSavingTab(null);
    }
  };

  const addExpenseItem = () => {
    if (!newExpenseItem.trim() || newExpenseAmount === "" || !newExpenseDate) return;
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      item: newExpenseItem.trim(),
      amount: Number(newExpenseAmount),
      date: newExpenseDate,
      note: newExpenseNote.trim(),
    };
    const updatedItems = [...expenseItems, newItem].sort((a, b) => a.date.localeCompare(b.date));
    setExpenseItems(updatedItems);
    void saveExpenseItems(updatedItems);
    setNewExpenseItem("");
    setNewExpenseAmount("");
    setNewExpenseDate("");
    setNewExpenseNote("");
  };

  const deleteExpenseItem = (id: string) => {
    const updatedItems = expenseItems.filter((e) => e.id !== id);
    setExpenseItems(updatedItems);
    void saveExpenseItems(updatedItems);
  };

  const updateExpenseItem = (id: string, updates: Partial<ExpenseItem>) => {
    const updatedItems = expenseItems
      .map((e) => (e.id === id ? { ...e, ...updates } : e))
      .sort((a, b) => a.date.localeCompare(b.date));
    setExpenseItems(updatedItems);
    void saveExpenseItems(updatedItems);
    setEditingExpenseId(null);
  };

  return (
    <div className="mt-5 w-full rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-gray-700">Card Tabs</p>
        <div className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("discussion")}
            className={`flex-1 rounded-md px-2 py-1.5 text-center font-medium transition-colors sm:flex-none sm:px-4 ${
              activeTab === "discussion"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-violet-600"
            } text-xs sm:text-sm`}
          >
            Discussion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 rounded-md px-2 py-1.5 text-center font-medium transition-colors sm:flex-none sm:px-4 ${
              activeTab === "calendar"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-violet-600"
            } text-xs sm:text-sm`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`flex-1 rounded-md px-2 py-1.5 text-center font-medium transition-colors sm:flex-none sm:px-4 ${
              activeTab === "expense"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-violet-600"
            } text-xs sm:text-sm`}
          >
            Expense
          </button>
        </div>
      </div>

      <div className="mt-2 min-h-[200px]">
        {activeTab === "discussion" ? (
          <CardDiscussion cardId={card.id} hideHeader={true} />
        ) : activeTab === "calendar" ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Add events with dates, times, and notes. Events are sorted chronologically.
            </p>

            {/* Event List */}
            {calendarEvents.length > 0 && (
              <div className="space-y-2">
                {calendarEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      {editingEventId === event.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="date"
                              defaultValue={event.date}
                              onChange={(e) => updateCalendarEvent(event.id, { date: e.target.value })}
                              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                            />
                            <input
                              type="time"
                              defaultValue={event.time}
                              onChange={(e) => updateCalendarEvent(event.id, { time: e.target.value })}
                              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            defaultValue={event.note}
                            onBlur={(e) => updateCalendarEvent(event.id, { note: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateCalendarEvent(event.id, { note: e.target.value });
                              }
                            }}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-violet-500" />
                            <span className="font-medium text-gray-900">
                              {format(new Date(event.date), "MMM d, yyyy")}
                            </span>
                            {event.time && (
                              <>
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-600">{event.time}</span>
                              </>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-700">{event.note}</p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingEventId === event.id ? (
                        <button
                          type="button"
                          onClick={() => setEditingEventId(null)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingEventId(event.id)}
                          className="rounded p-1 text-gray-400 hover:bg-violet-100 hover:text-violet-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCalendarEvent(event.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Event */}
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <p className="mb-2 text-xs font-medium text-violet-700">Add New Event</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-600">Date *</label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-600">Time (optional)</label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Note *</label>
                  <input
                    type="text"
                    value={newEventNote}
                    onChange={(e) => setNewEventNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newEventDate && newEventNote.trim()) {
                        addCalendarEvent();
                      }
                    }}
                    placeholder="Meeting, deadline, reminder..."
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addCalendarEvent}
                    disabled={!newEventDate || !newEventNote.trim() || savingTab === "calendar"}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTab === "calendar" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Track expenses with item name, amount, date, and notes. Amounts are shown in a table.
            </p>

            {/* Expense Table */}
            {expenseItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Item</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Amount</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Note</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseItems.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        {editingExpenseId === expense.id ? (
                          <>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                defaultValue={expense.item}
                                onBlur={(e) => updateExpenseItem(expense.id, { item: e.target.value })}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                                autoFocus
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                defaultValue={expense.amount}
                                onBlur={(e) => updateExpenseItem(expense.id, { amount: Number(e.target.value) })}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="date"
                                defaultValue={expense.date}
                                onChange={(e) => updateExpenseItem(expense.id, { date: e.target.value })}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                defaultValue={expense.note}
                                onBlur={(e) => updateExpenseItem(expense.id, { note: e.target.value })}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingExpenseId(null)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 font-medium text-gray-900">{expense.item}</td>
                            <td className="px-3 py-2">
                              <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                                <DollarSign className="h-3.5 w-3.5" />
                                {expense.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{expense.note || "—"}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingExpenseId(expense.id)}
                                  className="rounded p-1 text-gray-400 hover:bg-violet-100 hover:text-violet-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteExpenseItem(expense.id)}
                                  className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                      <td className="px-3 py-2 text-gray-900">Total</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <DollarSign className="h-4 w-4" />
                          {expenseItems.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                        </span>
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Add New Expense */}
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
              <p className="mb-2 text-xs font-medium text-violet-700">Add New Expense</p>
              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Item *</label>
                    <input
                      type="text"
                      value={newExpenseItem}
                      onChange={(e) => setNewExpenseItem(e.target.value)}
                      placeholder="Equipment, materials, service..."
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Amount *</label>
                    <input
                      type="number"
                      value={newExpenseAmount}
                      onChange={(e) =>
                        setNewExpenseAmount(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Date *</label>
                    <input
                      type="date"
                      value={newExpenseDate}
                      onChange={(e) => setNewExpenseDate(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Note (optional)</label>
                    <input
                      type="text"
                      value={newExpenseNote}
                      onChange={(e) => setNewExpenseNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          newExpenseItem.trim() &&
                          newExpenseAmount !== "" &&
                          newExpenseDate
                        ) {
                          addExpenseItem();
                        }
                      }}
                      placeholder="Payment method, vendor..."
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addExpenseItem}
                    disabled={
                      !newExpenseItem.trim() ||
                      newExpenseAmount === "" ||
                      !newExpenseDate ||
                      savingTab === "expense"
                    }
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTab === "expense" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Add Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
