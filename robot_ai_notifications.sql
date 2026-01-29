-- ###########################################################
-- ROBÔ DE RECOMENDAÇÕES SUGGESTO (AI ROBOT v1.0)
-- Este script cria a inteligência dentro do banco de dados para
-- sugerir conteúdos baseados no que o usuário gosta.
-- ###########################################################

-- 1. FUNÇÃO PRINCIPAL DO ROBÔ
-- Esta função analisa os likes de cada usuário e gera uma notificação personalizada
create or replace function public.run_recommendation_robot()
returns text as $$
declare
    rec record;
    suggested_title text;
    suggested_type text;
    total_notifications integer := 0;
begin
    -- Loop por todos os usuários que têm alguma preferência ou like
    for rec in 
        select p.id, p.username, 
               coalesce(p.preferences->>'genres', '[]') as favored_genres
        from public.profiles p
    loop
        -- TENTA ENCONTRAR UM CONTEÚDO QUE O USUÁRIO AINDA NÃO CURTIU
        -- E QUE SEJA DE UM TIPO/GÊNERO QUE ELE GOSTA
        
        -- Busca um GAME que ele possa gostar (do acervo local)
        select title, 'game' into suggested_title, suggested_type
        from public.games
        where genres::text ilike any (
            select '%' || trim(both '"' from elem::text) || '%'
            from jsonb_array_elements(rec.favored_genres::jsonb) as elem
        )
        and id::text not in (select media_id from public.likes where user_id = rec.id)
        order by random() -- Pega um aleatório para variar a sugestão
        limit 1;

        -- Se não achou game, tenta um LIVRO (do acervo local)
        if suggested_title is null then
            select title, 'book' into suggested_title, suggested_type
            from public.books
            where genres::text ilike any (
                select '%' || trim(both '"' from elem::text) || '%'
                from jsonb_array_elements(rec.favored_genres::jsonb) as elem
            )
            and id::text not in (select media_id from public.likes where user_id = rec.id)
            order by random()
            limit 1;
        end if;

        -- SE ENCONTROU ALGO, GERA A NOTIFICAÇÃO
        if suggested_title is not null then
            insert into public.notifications (user_id, title, message, type)
            values (
                rec.id, 
                'Dica do Robô Suggesto! ✨', 
                'Olá ' || split_part(rec.username, ' ', 1) || ', achamos que você vai adorar o ' || 
                (case when suggested_type = 'game' then 'jogo ' else 'livro ' end) || 
                '"' || suggested_title || '". Ele combina muito com seu estilo!',
                'recommendation'
            );
            total_notifications := total_notifications + 1;
        end if;

        -- Reseta para o próximo usuário
        suggested_title := null;
    end loop;

    return 'Robô finalizado! Foram geradas ' || total_notifications || ' notificações personalizadas.';
end;
$$ language plpgsql security definer;

-- Comentário: Opcionalmente, você pode habilitar o "cron" do Supabase 
-- para rodar isso toda sexta-feira às 18h:
-- SELECT cron.schedule('friday-recommendations', '0 18 * * 5', 'SELECT run_recommendation_robot()');
