export type agendaItem = {
    name: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
}

export type agendaDay = {
    date: Date;
    items: agendaItem[];
}

export type teamMemberAgenda = {
    staffMember: string;
    name: string;
    description: string;
    days: agendaDay[];
}

export type agenda = teamMemberAgenda[];
