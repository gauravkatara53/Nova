import re

with open('src/app/(dashboard)/follow-ups/page.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    '''import {
  getFollowUps,
  updateFollowUpStatus,
  updateFollowUpContent,
} from "@/actions/follow-ups";''',
    '''import {
  getFollowUps,
  updateFollowUpStatus,
  updateFollowUpContent,
  markEmailFollowUpSent,
  markEmailFollowUpSkipped,
} from "@/actions/follow-ups";'''
)

# 2. Add status to UnifiedFollowUp
content = content.replace(
    '''type UnifiedFollowUp = {
  id: string; // FollowUp id or ColdEmail id (prefixed)
  source: "model" | "email"; // where this came from
  dueDate: string;''',
    '''type UnifiedFollowUp = {
  id: string; // FollowUp id or ColdEmail id (prefixed)
  source: "model" | "email"; // where this came from
  status: "PENDING" | "SENT" | "SKIPPED";
  dueDate: string;'''
)

# 3. Update FollowUpItem Component
content = content.replace(
    '''  variant: "today" | "overdue" | "upcoming";''',
    '''  variant: "today" | "overdue" | "upcoming" | "completed";'''
)

content = content.replace(
    '''        {variant === "today" && (''',
    '''        {variant === "completed" && (
          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">
            Completed
          </Badge>
        )}
        {variant === "today" && ('''
)

old_buttons = '''        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onDismiss(item)}
          disabled={isUpdating}
        >
          <SkipForward className="h-3 w-3" />
          Dismiss
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => onGenerate(item)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          {item.generatedContent ? "Regenerate" : "Generate"}
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
          onClick={() => onMarkSent(item)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Mail className="h-3 w-3" />
          )}
          Mark Sent
        </Button>'''

new_buttons = '''        {variant !== "completed" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(item)}
              disabled={isUpdating}
            >
              <SkipForward className="h-3 w-3" />
              Dismiss
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => onGenerate(item)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {item.generatedContent ? "Regenerate" : "Generate"}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
              onClick={() => onMarkSent(item)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Mail className="h-3 w-3" />
              )}
              Mark Sent
            </Button>
          </>
        )}'''

content = content.replace(old_buttons, new_buttons)


# 4. Empty Tab State
content = content.replace(
    '''  variant: "today" | "overdue" | "upcoming";''',
    '''  variant: "today" | "overdue" | "upcoming" | "completed";'''
)

content = content.replace(
    '''    upcoming: {
      icon: Inbox,
      iconColor: "text-muted-foreground",
      title: "No upcoming follow-ups",
      description:
        "Follow-ups will appear here when you add a Follow Up Date on your cold emails.",
    },''',
    '''    upcoming: {
      icon: Inbox,
      iconColor: "text-muted-foreground",
      title: "No upcoming follow-ups",
      description:
        "Follow-ups will appear here when you add a Follow Up Date on your cold emails.",
    },
    completed: {
      icon: CheckCircle,
      iconColor: "text-green-500",
      title: "No completed follow-ups",
      description: "You haven't completed any follow-ups yet.",
    },'''
)

# 5. Building unified list
content = content.replace(
    '''      source: "email",
      dueDate: email.followUpDate,''',
    '''      source: "email",
      status: "PENDING",
      dueDate: email.followUpDate,'''
)

content = content.replace(
    '''  for (const fu of modelFollowUps as any[]) {
    if (coveredEmailIds.has(fu.coldEmailId)) continue;''',
    '''  for (const fu of modelFollowUps as any[]) {
    if (fu.status === "PENDING" && coveredEmailIds.has(fu.coldEmailId)) continue;'''
)

content = content.replace(
    '''      source: "model",
      dueDate: fu.dueDate,''',
    '''      source: "model",
      status: fu.status,
      dueDate: fu.dueDate,'''
)

content = content.replace(
    '''  const todayFollowUps = unifiedFollowUps.filter((f) => {''',
    '''  const pendingFollowUps = unifiedFollowUps.filter((f) => f.status === "PENDING");
  const completedFollowUps = unifiedFollowUps.filter((f) => f.status === "SENT");

  const todayFollowUps = pendingFollowUps.filter((f) => {'''
)

content = content.replace(
    '''  const overdueFollowUps = unifiedFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() < todayStart
  );
  const upcomingFollowUps = unifiedFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() >= todayEnd
  );''',
    '''  const overdueFollowUps = pendingFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() < todayStart
  );
  const upcomingFollowUps = pendingFollowUps.filter(
    (f) => new Date(f.dueDate).getTime() >= todayEnd
  );'''
)

# 6. Mutations
content = content.replace(
    '''      } else {
        // For email source, update the cold email status to FOLLOW_UP_SENT
        // and clear the followUpDate
        return updateColdEmail(item.coldEmailId, {
          status: "FOLLOW_UP_SENT" as any,
          followUpDate: undefined,
        });
      }''',
    '''      } else {
        return markEmailFollowUpSent(item.coldEmailId);
      }'''
)

content = content.replace(
    '''      } else {
        // Clear the followUpDate on the cold email
        return updateColdEmail(item.coldEmailId, {
          followUpDate: undefined,
        });
      }''',
    '''      } else {
        return markEmailFollowUpSkipped(item.coldEmailId);
      }'''
)

# 7. Render helpers
content = content.replace(
    '''  const renderFollowUpList = (
    items: UnifiedFollowUp[],
    variant: "today" | "overdue" | "upcoming"
  ) => {''',
    '''  const renderFollowUpList = (
    items: UnifiedFollowUp[],
    variant: "today" | "overdue" | "upcoming" | "completed"
  ) => {'''
)

# 8. Render tabs
content = content.replace(
    '''          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {upcomingFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>''',
    '''          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {upcomingFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed
            {completedFollowUps.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {completedFollowUps.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>'''
)

content = content.replace(
    '''        <TabsContent value="upcoming" className="space-y-2">
          {renderFollowUpList(upcomingFollowUps, "upcoming")}
        </TabsContent>
      </Tabs>''',
    '''        <TabsContent value="upcoming" className="space-y-2">
          {renderFollowUpList(upcomingFollowUps, "upcoming")}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          {renderFollowUpList(completedFollowUps, "completed")}
        </TabsContent>
      </Tabs>'''
)


with open('src/app/(dashboard)/follow-ups/page.tsx', 'w') as f:
    f.write(content)
