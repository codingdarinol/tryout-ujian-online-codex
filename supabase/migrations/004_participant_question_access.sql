-- Allow participants to read published questions and options for exams they can access.

create policy "Participants read published questions"
on public.questions
for select
using (
  public.get_my_role() = 'admin'
  or exists (
    select 1
    from public.exams e
    join public.profiles p on p.id = auth.uid()
    where e.id = questions.exam_id
      and e.is_published = true
      and (
        public.get_my_role() = 'admin'
        or e.package_id is null
        or (e.package_id is not null
            and coalesce(p.purchased_packages, '{}'::text[]) @> array[e.package_id])
      )
  )
);

create policy "Participants read published options"
on public.question_options
for select
using (
  public.get_my_role() = 'admin'
  or exists (
    select 1
    from public.questions q
    join public.exams e on e.id = q.exam_id
    join public.profiles p on p.id = auth.uid()
    where q.id = question_options.question_id
      and e.is_published = true
      and (
        public.get_my_role() = 'admin'
        or e.package_id is null
        or (e.package_id is not null
            and coalesce(p.purchased_packages, '{}'::text[]) @> array[e.package_id])
      )
  )
);
