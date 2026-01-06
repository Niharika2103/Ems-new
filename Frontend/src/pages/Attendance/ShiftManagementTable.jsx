

export default function ShiftManagementTable() {
      return (
   <Card>
        <CardHeader title="Shift Assignment History" />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>OT</TableCell>
              <TableCell>Max OT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No assignments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
  );
}