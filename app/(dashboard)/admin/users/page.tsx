import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Shield } from "lucide-react";

import { auth } from "@/lib/auth";
import { getAllUsers } from "@/app/actions/admin-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const users = await getAllUsers();

  if (!users) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header with gradient badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary">
                Admin - User Management
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage users, roles, and permissions across your organization
              </p>
            </div>
          </div>
          <Link href="/admin/users/create">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        {/* Main Card with Glassmorphism */}
        <Card className="border-border bg-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl">All Users</CardTitle>
            <CardDescription className="text-base">
              {users.length} user{users.length !== 1 ? "s" : ""} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"/>
                
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-card backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/10 hover:bg-primary/20">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Team</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Reports</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "ADMIN" ? "default" : "secondary"}
                            className={user.role === "ADMIN" ? "bg-primary text-primary-foreground" : ""}>
                          
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.department?.name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{user.team?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "ACTIVE"
                                ? "default"
                                : user.status === "INACTIVE"
                                ? "secondary"
                                : "destructive"
                            }
                            className={user.status === "ACTIVE" ? "bg-green-500" : ""}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {user._count.employees}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/users/${user.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-muted/50 hover:text-primary transition-all"
                            >
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
