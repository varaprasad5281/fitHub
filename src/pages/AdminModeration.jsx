import React, { useState } from "react";
import { api } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AdminModeration() {
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user integrity data
  const { data: integrityUsers } = useQuery({
    queryKey: ["integrityUsers"],
    queryFn: () => api.asServiceRole.entities.UserIntegrity.list(),
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ["auditLogs", selectedUser?.id],
    queryFn: () =>
      selectedUser
        ? api.asServiceRole.entities.PointsAuditLog.filter({
            user_email: selectedUser.user_email,
          })
        : Promise.resolve([]),
  });

  // Fetch admin audit logs
  const { data: adminLogs } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: () => api.asServiceRole.entities.AdminAuditLog.list(),
  });

  const filtered =
    integrityUsers?.filter((u) =>
      u.user_email?.toLowerCase().includes(searchEmail.toLowerCase()),
    ) || [];

  const getStatusColor = (status) => {
    const colors = {
      normal: "bg-green-500",
      flagged: "bg-yellow-500",
      hidden: "bg-orange-500",
      suspended: "bg-red-500",
      banned: "bg-red-700",
    };
    return colors[status] || "bg-gray-500";
  };

  const performAction = async (action) => {
    if (!selectedUser || !actionReason.trim()) {
      toast.error("Please select user and provide reason");
      return;
    }

    setIsProcessing(true);
    try {
      // Update user integrity
      const updates = {
        suspended: { integrity_status: "suspended" },
        banned: { integrity_status: "banned" },
        hide: { integrity_status: "hidden" },
        unhide: {
          integrity_status: "normal",
          integrity_score: Math.min(selectedUser.integrity_score + 10, 100),
        },
        reset: {
          integrity_score: 100,
          integrity_status: "normal",
          flags: [],
          suspicious_events: 0,
        },
      };

      if (updates[action]) {
        await api.asServiceRole.entities.UserIntegrity.update(
          selectedUser.id,
          updates[action],
        );
      }

      // Log admin action
      await api.asServiceRole.entities.AdminAuditLog.create({
        admin_email: (await api.auth.me()).email,
        target_user_email: selectedUser.user_email,
        action,
        reason: actionReason,
        details: { integrity_score: selectedUser.integrity_score },
      });

      toast.success(
        `Action "${action}" completed for ${selectedUser.user_email}`,
      );
      setActionReason("");
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to perform action: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Admin Moderation Panel
        </h1>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="bg-zinc-900">
            <TabsTrigger value="search">Search Users</TabsTrigger>
            <TabsTrigger value="audit">Admin Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Search User Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filtered.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUser?.id === user.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">
                            {user.user_email}
                          </p>
                          <p className="text-sm text-zinc-400">
                            Score: {user.integrity_score}/100
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(user.integrity_status)}
                        >
                          {user.integrity_status.toUpperCase()}
                        </Badge>
                      </div>
                      {user.flags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.flags.slice(0, 3).map((flag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {flag.flag_type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedUser && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    Actions for {selectedUser.user_email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-800/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-zinc-300">
                      <strong>Status:</strong> {selectedUser.integrity_status}
                    </p>
                    <p className="text-sm text-zinc-300">
                      <strong>Score:</strong> {selectedUser.integrity_score}/100
                    </p>
                    <p className="text-sm text-zinc-300">
                      <strong>Suspicious Events:</strong>{" "}
                      {selectedUser.suspicious_events || 0}
                    </p>
                  </div>

                  <textarea
                    placeholder="Reason for action..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => performAction("hide")}
                      disabled={isProcessing}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <EyeOff className="w-4 h-4 mr-2" /> Hide Leaderboard
                    </Button>
                    <Button
                      onClick={() => performAction("unhide")}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Restore
                    </Button>
                    <Button
                      onClick={() => performAction("suspended")}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Ban className="w-4 h-4 mr-2" /> Suspend
                    </Button>
                    <Button
                      onClick={() => performAction("reset")}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Reset Score
                    </Button>
                  </div>

                  <div className="border-t border-zinc-700 pt-4">
                    <h3 className="text-white font-semibold mb-3">
                      Points Audit Log
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {auditLogs?.slice(0, 20).map((log) => (
                        <div
                          key={log.id}
                          className="text-xs bg-zinc-800/50 p-2 rounded"
                        >
                          <p className="text-amber-400">{log.event_type}</p>
                          <p className="text-zinc-400">{log.reason}</p>
                          {log.integrity_flags?.length > 0 && (
                            <p className="text-red-400">
                              🚩 {log.integrity_flags.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Admin Actions History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {adminLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="text-sm bg-zinc-800/50 p-3 rounded"
                    >
                      <div className="flex justify-between">
                        <p className="text-zinc-300">
                          <strong>{log.admin_email}</strong>
                        </p>
                        <Badge variant="outline">{log.action}</Badge>
                      </div>
                      <p className="text-zinc-400">
                        Target: {log.target_user_email}
                      </p>
                      <p className="text-zinc-500">{log.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
